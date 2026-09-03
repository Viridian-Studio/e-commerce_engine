import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto, UpdateOrderStatusDto, UpdatePaymentStatusDto } from './dto/order.dto';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import { generateOrderNumber, roundMoney } from '../../common/utils/slug';
import { FulfillmentStatus, OrderStatus, PaymentStatus } from '@ecom/types';
import type { Order as OrderType, OrderEvent, Paginated } from '@ecom/types';

@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private readonly model: Model<OrderDocument>) {}

  async create(storeId: string, dto: CreateOrderDto): Promise<OrderType> {
    const totals = {
      ...dto.totals,
      subtotal: roundMoney(dto.totals.subtotal),
      discount: roundMoney(dto.totals.discount),
      shipping: roundMoney(dto.totals.shipping),
      tax: roundMoney(dto.totals.tax),
      total: roundMoney(dto.totals.total),
    };
    const items = dto.items.map((i) => ({
      ...i,
      productId: new Types.ObjectId(i.productId),
      variantId: i.variantId ? new Types.ObjectId(i.variantId) : null,
      total: roundMoney(i.total),
    }));
    const status = dto.status ?? OrderStatus.PENDING;
    const timeline: OrderEvent[] = [
      { status, createdAt: new Date() as any, note: 'Order created' },
    ];
    const order = await this.model.create({
      storeId,
      number: generateOrderNumber(),
      customerId: dto.customerId ? new Types.ObjectId(dto.customerId) : null,
      customer: dto.customerEmail
        ? {
            name: dto.customerName ?? '',
            email: dto.customerEmail,
            phone: dto.customerPhone,
          }
        : undefined,
      items,
      totals,
      shippingAddress: dto.shippingAddress ?? null,
      billingAddress: dto.billingAddress ?? null,
      status,
      paymentStatus: dto.paymentStatus ?? PaymentStatus.PENDING,
      fulfillmentStatus: dto.fulfillmentStatus ?? FulfillmentStatus.UNFULFILLED,
      payment: {
        provider: dto.paymentProvider ?? 'manual',
        transactionId: dto.paymentTransactionId,
        method: dto.paymentMethod,
      },
      timeline,
    });
    return order.toJSON<OrderType>();
  }

  async findAll(storeId: string, query: ListQueryDto): Promise<Paginated<OrderType>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) {
      filter.$or = [
        { number: { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
      ];
    }
    if (query.status) filter.status = query.status;
    const sort: Record<string, 1 | -1> = { [sortField ?? 'createdAt']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return paginate(items.map((i) => i.toJSON<OrderType>()), page, limit, total);
  }

  async findById(id: string): Promise<OrderType> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Order not found');
    return item.toJSON<OrderType>();
  }

  async findByNumber(storeId: string, number: string): Promise<OrderType | null> {
    const item = await this.model.findOne({ storeId, number }).exec();
    return item ? item.toJSON<OrderType>() : null;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<OrderType> {
    const event: OrderEvent = { status: dto.status, note: dto.note, createdAt: new Date() as any };
    const item = await this.model
      .findByIdAndUpdate(
        id,
        { status: dto.status, $push: { timeline: event } },
        { new: true },
      )
      .exec();
    if (!item) throw new NotFoundException('Order not found');
    return item.toJSON<OrderType>();
  }

  async updatePaymentStatus(id: string, dto: UpdatePaymentStatusDto): Promise<OrderType> {
    const update: Record<string, unknown> = { paymentStatus: dto.paymentStatus };
    if (dto.transactionId) update['payment.transactionId'] = dto.transactionId;
    const item = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!item) throw new NotFoundException('Order not found');
    return item.toJSON<OrderType>();
  }

  async setFulfillment(id: string, status: FulfillmentStatus): Promise<OrderType> {
    const item = await this.model
      .findByIdAndUpdate(id, { fulfillmentStatus: status }, { new: true })
      .exec();
    if (!item) throw new NotFoundException('Order not found');
    return item.toJSON<OrderType>();
  }

  async remove(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async countByStore(storeId: string): Promise<number> {
    return this.model.countDocuments({ storeId }).exec();
  }

  async revenueByStore(storeId: string): Promise<number> {
    const [agg] = await this.model
      .aggregate<{ total: number }>([
        { $match: { storeId, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totals.total' } } },
      ])
      .exec();
    return agg ? roundMoney(agg.total) : 0;
  }

  async recentOrders(storeId: string, limit: number): Promise<OrderType[]> {
    const items = await this.model.find({ storeId }).sort({ createdAt: -1 }).limit(limit).exec();
    return items.map((i) => i.toJSON<OrderType>());
  }

  async salesSeries(storeId: string, days: number): Promise<{ date: string; revenue: number; orders: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await this.model
      .aggregate<{ _id: string; revenue: number; orders: number }>([
        { $match: { storeId, createdAt: { $gte: since }, paymentStatus: 'paid' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totals.total' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .exec();
    return rows.map((r) => ({ date: r._id, revenue: roundMoney(r.revenue), orders: r.orders }));
  }

  async orderStatusBreakdown(storeId: string): Promise<{ status: OrderStatus; count: number }[]> {
    const rows = await this.model
      .aggregate<{ _id: OrderStatus; count: number }>([
        { $match: { storeId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ])
      .exec();
    return rows.map((r) => ({ status: r._id, count: r.count }));
  }

  async topProducts(storeId: string, limit: number): Promise<
    { productId: string; name: string; units: number; revenue: number }[]
  > {
    const rows = await this.model
      .aggregate<{ _id: Types.ObjectId; name: string; units: number; revenue: number }>([
        { $match: { storeId, paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            units: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.total' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: limit },
      ])
      .exec();
    return rows.map((r) => ({
      productId: r._id.toString(),
      name: r.name,
      units: r.units,
      revenue: roundMoney(r.revenue),
    }));
  }
}
