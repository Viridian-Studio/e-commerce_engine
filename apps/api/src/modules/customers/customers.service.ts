import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import type { Customer as CustomerType, Paginated } from '@ecom/types';

@Injectable()
export class CustomersService {
  constructor(@InjectModel(Customer.name) private readonly model: Model<CustomerDocument>) {}

  async create(storeId: string, dto: CreateCustomerDto): Promise<CustomerType> {
    const doc = await this.model.create({
      storeId,
      ...dto,
      email: dto.email.toLowerCase(),
      addresses: (dto.addresses ?? []).map((a) => ({ ...a, _id: new Types.ObjectId() })) as any,
    });
    return doc.toJSON<CustomerType>();
  }

  async findAll(storeId: string, query: ListQueryDto): Promise<Paginated<CustomerType>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }
    if (query.status) filter.status = query.status;
    const sort: Record<string, 1 | -1> = { [sortField ?? 'createdAt']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return paginate(items.map((i) => i.toJSON<CustomerType>()), page, limit, total);
  }

  async findById(id: string): Promise<CustomerType> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Customer not found');
    return item.toJSON<CustomerType>();
  }

  async findByEmail(storeId: string, email: string): Promise<CustomerType | null> {
    const item = await this.model.findOne({ storeId, email: email.toLowerCase() }).exec();
    return item ? item.toJSON<CustomerType>() : null;
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<CustomerType> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.email) update.email = dto.email.toLowerCase();
    if (dto.addresses) {
      update.addresses = dto.addresses.map((a) => ({ ...a, _id: a.id ? new Types.ObjectId(a.id) : new Types.ObjectId() }));
    }
    const item = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!item) throw new NotFoundException('Customer not found');
    return item.toJSON<CustomerType>();
  }

  async remove(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async countByStore(storeId: string): Promise<number> {
    return this.model.countDocuments({ storeId }).exec();
  }
}
