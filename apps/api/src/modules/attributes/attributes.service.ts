import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attribute, AttributeDocument } from './schemas/attribute.schema';
import { CreateAttributeDto, UpdateAttributeDto } from './dto/attribute.dto';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import { slugify } from '../../common/utils/slug';
import type { Attribute as AttributeType, Paginated } from '@ecom/types';

@Injectable()
export class AttributesService {
  constructor(@InjectModel(Attribute.name) private readonly model: Model<AttributeDocument>) {}

  async create(storeId: string, dto: CreateAttributeDto): Promise<AttributeType> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const doc = await this.model.create({ storeId, ...dto, slug });
    return doc.toJSON<AttributeType>();
  }

  async findAll(storeId: string, query: ListQueryDto): Promise<Paginated<AttributeType>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) filter.name = { $regex: search, $options: 'i' };
    const sort: Record<string, 1 | -1> = { [sortField ?? 'createdAt']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return paginate(items.map((i) => i.toJSON<AttributeType>()), page, limit, total);
  }

  async findAllList(storeId: string): Promise<AttributeType[]> {
    const items = await this.model.find({ storeId }).sort({ name: 1 }).exec();
    return items.map((i) => i.toJSON<AttributeType>());
  }

  async findById(id: string): Promise<AttributeType> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Attribute not found');
    return item.toJSON<AttributeType>();
  }

  async update(id: string, dto: UpdateAttributeDto): Promise<AttributeType> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug);
    else if (dto.name) update.slug = slugify(dto.name);
    const item = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!item) throw new NotFoundException('Attribute not found');
    return item.toJSON<AttributeType>();
  }

  async remove(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }
}
