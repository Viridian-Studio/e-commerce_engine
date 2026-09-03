import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto';
import { randomBytes } from 'crypto';
import { roundMoney } from '../../common/utils/slug';
import type { Cart as CartType } from '@ecom/types';

@Injectable()
export class CartsService {
  constructor(@InjectModel(Cart.name) private readonly model: Model<CartDocument>) {}

  async getOrCreate(storeId: string, token?: string, customerId?: string, currency?: string): Promise<CartType> {
    const doc = await this.getOrCreateDocument(storeId, token, customerId, currency);
    return doc.toJSON<CartType>();
  }

  private async getOrCreateDocument(
    storeId: string,
    token?: string,
    customerId?: string,
    currency?: string,
  ): Promise<CartDocument> {
    if (token) {
      const existing = await this.model.findOne({ storeId, token }).exec();
      if (existing) return existing;
    }
    if (customerId) {
      const existing = await this.model.findOne({ storeId, customerId: new Types.ObjectId(customerId) }).exec();
      if (existing) return existing;
    }
    return this.model.create({
      storeId,
      token: randomBytes(16).toString('hex'),
      customerId: customerId ? new Types.ObjectId(customerId) : null,
      items: [],
      ...(currency ? { currency } : {}),
    });
  }

  private async findDocumentById(id: string): Promise<CartDocument> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Cart not found');
    return item;
  }

  async findById(id: string): Promise<CartType> {
    const item = await this.findDocumentById(id);
    return item.toJSON<CartType>();
  }

  async findByToken(storeId: string, token: string): Promise<CartType | null> {
    const item = await this.model.findOne({ storeId, token }).exec();
    return item ? item.toJSON<CartType>() : null;
  }

  async addItem(cartId: string, dto: AddCartItemDto): Promise<CartType> {
    const cart = await this.findDocumentById(cartId);
    // If the cart is still empty and the incoming item carries a currency that
    // differs from the cart's (e.g. the cart was created via POST /cart with
    // the store's old currency), align the cart before adding the first item.
    if (dto.currency && cart.items.length === 0 && cart.currency !== dto.currency) {
      cart.currency = dto.currency;
    }
    const existingIdx = cart.items.findIndex(
      (i) =>
        i.productId.toString() === dto.productId &&
        ((i.variantId?.toString() ?? '') === (dto.variantId ?? '')),
    );
    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += dto.quantity;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(dto.productId),
        variantId: dto.variantId ? new Types.ObjectId(dto.variantId) : null,
        name: dto.name,
        sku: dto.sku,
        quantity: dto.quantity,
        price: roundMoney(dto.price),
        image: dto.image,
      } as any);
    }
    await cart.save();
    return cart.toJSON<CartType>();
  }

  async updateItem(cartId: string, itemId: string, dto: UpdateCartItemDto): Promise<CartType> {
    const cart = await this.findDocumentById(cartId);
    const item = cart.items.find((i) => (i as any)._id?.toString() === itemId);
    if (!item) throw new NotFoundException('Cart item not found');
    item.quantity = dto.quantity;
    await cart.save();
    return cart.toJSON<CartType>();
  }

  async removeItem(cartId: string, itemId: string): Promise<CartType> {
    const cart = await this.findDocumentById(cartId);
    cart.items = cart.items.filter((i) => (i as any)._id?.toString() !== itemId) as any;
    await cart.save();
    return cart.toJSON<CartType>();
  }

  async clear(cartId: string): Promise<void> {
    await this.model.updateOne({ _id: cartId }, { items: [] }).exec();
  }

  /**
   * Attaches a customer to a guest cart (identified by its token), so the cart
   * follows the customer after login/register. If no token is supplied (or the
   * token doesn't match a cart), falls back to the customer's existing cart,
   * creating one if needed. The cart's token is preserved either way.
   */
  async claimCart(storeId: string, customerId: string, token?: string): Promise<CartType> {
    if (token) {
      const cart = await this.model.findOne({ storeId, token }).exec();
      if (cart) {
        cart.customerId = new Types.ObjectId(customerId);
        await cart.save();
        return cart.toJSON<CartType>();
      }
    }
    return this.getOrCreate(storeId, undefined, customerId);
  }

  totals(cart: CartType): { subtotal: number; itemCount: number; currency: string } {
    const subtotal = roundMoney(cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal, itemCount, currency: cart.currency };
  }
}
