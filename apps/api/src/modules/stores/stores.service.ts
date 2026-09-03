import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './schemas/store.schema';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
import { slugify } from '../../common/utils/slug';
import type { Store as StoreType } from '@ecom/types';

@Injectable()
export class StoresService {
  constructor(@InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>) {}

  async create(dto: CreateStoreDto): Promise<StoreType> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const doc = await this.storeModel.create({ ...dto, slug });
    return doc.toJSON<StoreType>();
  }

  async findAll(): Promise<StoreType[]> {
    const items = await this.storeModel.find().sort({ createdAt: 1 }).exec();
    return items.map((i) => i.toJSON<StoreType>());
  }

  async findById(id: string): Promise<StoreType> {
    const store = await this.storeModel.findById(id).exec();
    if (!store) throw new NotFoundException('Store not found');
    return store.toJSON<StoreType>();
  }

  async findBySlug(slug: string): Promise<StoreType | null> {
    const store = await this.storeModel.findOne({ slug }).exec();
    return store ? store.toJSON<StoreType>() : null;
  }

  async update(id: string, dto: UpdateStoreDto): Promise<StoreType> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug);
    else if (dto.name) update.slug = slugify(dto.name);
    const store = await this.storeModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!store) throw new NotFoundException('Store not found');
    return store.toJSON<StoreType>();
  }

  async remove(id: string): Promise<void> {
    await this.storeModel.findByIdAndDelete(id).exec();
  }
}
