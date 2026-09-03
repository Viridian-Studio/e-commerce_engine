import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StoresService } from '../stores/stores.service';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { CollectionsService } from '../collections/collections.service';
import { BrandsService } from '../brands/brands.service';
import { CartsService } from '../carts/carts.service';
import { OrdersService } from '../orders/orders.service';
import { CustomersService } from '../customers/customers.service';
import { ShippingService } from '../shipping/shipping.service';
import { DiscountsService } from '../discounts/discounts.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { AddCartItemDto, UpdateCartItemDto } from '../carts/dto/cart.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { roundMoney } from '../../common/utils/slug';
import { ProductStatus } from '@ecom/types';
import type { Brand, Cart, Category, Collection, Order, Paginated, Product, Store } from '@ecom/types';

@Injectable()
export class StorefrontService {
  constructor(
    private readonly stores: StoresService,
    private readonly products: ProductsService,
    private readonly categories: CategoriesService,
    private readonly collections: CollectionsService,
    private readonly brands: BrandsService,
    private readonly carts: CartsService,
    private readonly orders: OrdersService,
    private readonly customers: CustomersService,
    private readonly shipping: ShippingService,
    private readonly discounts: DiscountsService,
  ) {}

  async resolveStore(slug?: string): Promise<Store> {
    if (!slug) throw new BadRequestException('Provide a store slug');
    const store = await this.stores.findBySlug(slug);
    if (!store) throw new NotFoundException('Store not found');
    return store;
  }

  listProducts(storeId: string, query: ListQueryDto): Promise<Paginated<Product>> {
    return this.products.findAll(storeId, { ...query, status: query.status ?? ProductStatus.ACTIVE });
  }

  async getProductBySlug(storeId: string, slug: string): Promise<Product> {
    const product = await this.products.findBySlug(storeId, slug);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  listCategories(storeId: string): Promise<Category[]> {
    return this.categories.findAllTree(storeId);
  }

  listCollections(storeId: string): Promise<Collection[]> {
    return this.collections.findAllList(storeId);
  }

  listBrands(storeId: string): Promise<Brand[]> {
    return this.brands.findAllList(storeId);
  }

  getShippingRate(storeId: string, country: string, subtotal: number): Promise<{ price: number; name: string }> {
    return this.shipping.computeRate(storeId, country, subtotal);
  }

  async previewDiscount(storeId: string, code: string, subtotal: number): Promise<{ amount: number; code: string }> {
    const { amount, discount } = await this.discounts.previewCode(storeId, code, subtotal);
    return { amount, code: discount.code };
  }

  async getOrCreateCart(storeId: string, token?: string): Promise<Cart> {
    const store = await this.stores.findById(storeId);
    return this.carts.getOrCreate(storeId, token, undefined, store.currency);
  }

  async getCartByToken(storeId: string, token: string): Promise<Cart> {
    const cart = await this.carts.findByToken(storeId, token);
    if (!cart) throw new NotFoundException('Cart not found');
    return cart;
  }

  async addItem(storeId: string, token: string | undefined, dto: AddCartItemDto): Promise<Cart> {
    const store = await this.stores.findById(storeId);
    const cart = await this.carts.getOrCreate(storeId, token, undefined, store.currency);
    return this.carts.addItem(cart._id, dto);
  }

  async updateItem(storeId: string, token: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getCartByToken(storeId, token);
    return this.carts.updateItem(cart._id, itemId, dto);
  }

  async removeItem(storeId: string, token: string, itemId: string): Promise<Cart> {
    const cart = await this.getCartByToken(storeId, token);
    return this.carts.removeItem(cart._id, itemId);
  }

  async checkout(storeId: string, dto: CheckoutDto): Promise<Order> {
    const cart = await this.carts.findByToken(storeId, dto.token);
    if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');

    let customerId: string | undefined;
    const existingCustomer = await this.customers.findByEmail(storeId, dto.email);
    if (existingCustomer) {
      customerId = existingCustomer._id;
    } else if (dto.firstName && dto.lastName) {
      const created = await this.customers.create(storeId, {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      });
      customerId = created._id;
    }

    const subtotal = roundMoney(cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0));
    const shippingRate = await this.shipping.computeRate(storeId, dto.shippingAddress.country, subtotal);

    let discountAmount = 0;
    if (dto.discountCode) {
      const applied = await this.discounts.applyCode(storeId, dto.discountCode, subtotal);
      discountAmount = applied.amount;
    }

    const tax = 0;
    const total = roundMoney(subtotal - discountAmount + shippingRate.price + tax);
    const fullName = [dto.firstName, dto.lastName].filter(Boolean).join(' ');

    const order = await this.orders.create(storeId, {
      customerId,
      customerName: fullName || undefined,
      customerEmail: dto.email,
      customerPhone: dto.phone,
      items: cart.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId ?? undefined,
        name: i.name,
        sku: i.sku,
        quantity: i.quantity,
        price: i.price,
        total: roundMoney(i.price * i.quantity),
        image: i.image,
      })),
      totals: {
        subtotal,
        discount: discountAmount,
        shipping: shippingRate.price,
        tax,
        total,
        currency: cart.currency,
      },
      shippingAddress: dto.shippingAddress,
      billingAddress: dto.billingAddress ?? dto.shippingAddress,
      paymentProvider: 'manual',
      paymentMethod: dto.paymentMethod,
    });

    await this.carts.clear(cart._id);
    return order;
  }
}
