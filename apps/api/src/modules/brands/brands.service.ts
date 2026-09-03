import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import { slugify } from '../../common/utils/slug';
import type { Brand as BrandType, Paginated } from '@ecom/types';

@Injectable()
export class BrandsService {
  constructor(@InjectModel(Brand.name) private readonly model: Model<BrandDocument>) {}

  async create(storeId: string, dto: CreateBrandDto): Promise<BrandType> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const doc = await this.model.create({ storeId, ...dto, slug });
    return doc.toJSON<BrandType>();
  }

  async findAll(storeId: string, query: ListQueryDto): Promise<Paginated<BrandType>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (query.status) filter.status = query.status;
    const sort: Record<string, 1 | -1> = { [sortField ?? 'createdAt']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return paginate(items.map((i) => i.toJSON<BrandType>()), page, limit, total);
  }

  async findAllList(storeId: string): Promise<BrandType[]> {
    const items = await this.model.find({ storeId, status: 'active' }).sort({ name: 1 }).exec();
    return items.map((i) => i.toJSON<BrandType>());
  }

  async findById(id: string): Promise<BrandType> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Brand not found');
    return item.toJSON<BrandType>();
  }

  async update(id: string, dto: UpdateBrandDto): Promise<BrandType> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug);
    else if (dto.name) update.slug = slugify(dto.name);
    const item = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!item) throw new NotFoundException('Brand not found');
    return item.toJSON<BrandType>();
  }

  async remove(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }
}
