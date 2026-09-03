import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Content, ContentDocument } from './schemas/content.schema';
import { CreateContentDto, UpdateContentDto } from './dto/content.dto';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import { slugify } from '../../common/utils/slug';
import type { Content as ContentType, Paginated } from '@ecom/types';

@Injectable()
export class ContentService {
  constructor(@InjectModel(Content.name) private readonly model: Model<ContentDocument>) {}

  async create(storeId: string, dto: CreateContentDto): Promise<ContentType> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.title);
    const doc = await this.model.create({ storeId, ...dto, slug });
    return doc.toJSON<ContentType>();
  }

  async findAll(storeId: string, query: ListQueryDto): Promise<Paginated<ContentType>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (query.status) filter.type = query.status;
    const sort: Record<string, 1 | -1> = { [sortField ?? 'createdAt']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return paginate(items.map((i) => i.toJSON<ContentType>()), page, limit, total);
  }

  async findById(id: string): Promise<ContentType> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Content not found');
    return item.toJSON<ContentType>();
  }

  async update(id: string, dto: UpdateContentDto): Promise<ContentType> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug);
    else if (dto.title) update.slug = slugify(dto.title);
    const item = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!item) throw new NotFoundException('Content not found');
    return item.toJSON<ContentType>();
  }

  async remove(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }
}
