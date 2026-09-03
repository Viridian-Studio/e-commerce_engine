import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReturnRequest, ReturnRequestDocument } from './schemas/return.schema';
import { CreateReturnDto, UpdateReturnStatusDto } from './dto/return.dto';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import { generateOrderNumber } from '../../common/utils/slug';
import type { Paginated, ReturnRequest as SharedReturnRequest } from '@ecom/types';

@Injectable()
export class ReturnsService {
  constructor(@InjectModel(ReturnRequest.name) private readonly model: Model<ReturnRequestDocument>) {}

  async create(storeId: string, dto: CreateReturnDto): Promise<SharedReturnRequest> {
    const doc = await this.model.create({
      storeId,
      orderId: new Types.ObjectId(dto.orderId),
      number: generateOrderNumber('RET'),
      type: dto.type ?? 'refund',
      reason: dto.reason,
      refundAmount: dto.refundAmount ?? 0,
      items: dto.items.map((i) => ({
        productId: new Types.ObjectId(i.productId),
        variantId: i.variantId ? new Types.ObjectId(i.variantId) : (null as any),
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    });
    return doc.toJSON<SharedReturnRequest>();
  }

  async findAll(storeId: string, query: ListQueryDto): Promise<Paginated<SharedReturnRequest>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) filter.number = { $regex: search, $options: 'i' };
    if (query.status) filter.status = query.status;
    const sort: Record<string, 1 | -1> = { [sortField ?? 'createdAt']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return paginate(items.map((i) => i.toJSON<SharedReturnRequest>()), page, limit, total);
  }

  async findById(id: string): Promise<SharedReturnRequest> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Return not found');
    return item.toJSON<SharedReturnRequest>();
  }

  async updateStatus(id: string, dto: UpdateReturnStatusDto): Promise<SharedReturnRequest> {
    const item = await this.model.findByIdAndUpdate(id, { status: dto.status }, { new: true }).exec();
    if (!item) throw new NotFoundException('Return not found');
    return item.toJSON<SharedReturnRequest>();
  }
}
