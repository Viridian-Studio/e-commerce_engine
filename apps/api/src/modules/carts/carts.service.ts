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

  async getOrCreate(storeId: string, token?: string, customerId?: string): Promise<CartType> {
    const doc = await this.getOrCreateDocument(storeId, token, customerId);
    return doc.toJSON<CartType>();
  }

  private async getOrCreateDocument(storeId: string, token?: string, customerId?: string): Promise<CartDocument> {
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

  totals(cart: CartType): { subtotal: number; itemCount: number; currency: string } {
    const subtotal = roundMoney(cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
    const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    return { subtotal, itemCount, currency: cart.currency };
  }
}
