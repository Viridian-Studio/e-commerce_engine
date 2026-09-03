import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import { slugify } from '../../common/utils/slug';
import type { Category as CategoryType, CategoryStatus, Paginated } from '@ecom/types';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private readonly model: Model<CategoryDocument>) {}

  async create(storeId: string, dto: CreateCategoryDto): Promise<CategoryType> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const doc = await this.model.create({
      storeId,
      ...dto,
      slug,
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : null,
    });
    return doc.toJSON<CategoryType>();
  }

  async findAll(storeId: string, query: ListQueryDto): Promise<Paginated<CategoryType>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (query.status) filter.status = query.status;
    const sort: Record<string, 1 | -1> = { [sortField ?? 'createdAt']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return paginate(items.map((i) => i.toJSON<CategoryType>()), page, limit, total);
  }

  async findAllTree(storeId: string): Promise<CategoryType[]> {
    const items = await this.model.find({ storeId }).sort({ name: 1 }).exec();
    return items.map((i) => i.toJSON<CategoryType>());
  }

  async findById(id: string): Promise<CategoryType> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Category not found');
    return item.toJSON<CategoryType>();
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryType> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug);
    else if (dto.name) update.slug = slugify(dto.name);
    if (dto.parentId) update.parentId = new Types.ObjectId(dto.parentId);
    const item = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!item) throw new NotFoundException('Category not found');
    return item.toJSON<CategoryType>();
  }

  async bulkStatus(ids: string[], status: CategoryStatus): Promise<{ modified: number }> {
    const res = await this.model.updateMany({ _id: { $in: ids } }, { status }).exec();
    return { modified: res.modifiedCount };
  }

  async remove(id: string): Promise<void> {
    // Re-parent children to root
    await this.model.updateMany({ parentId: new Types.ObjectId(id) }, { parentId: null }).exec();
    await this.model.findByIdAndDelete(id).exec();
  }
}
