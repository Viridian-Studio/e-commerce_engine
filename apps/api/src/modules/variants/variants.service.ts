import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductVariant, ProductVariantDocument } from './schemas/variant.schema';
import { CreateVariantDto, UpdateVariantDto, AdjustStockDto } from './dto/variant.dto';
import { slugify } from '../../common/utils/slug';
import type { ProductVariant as Variant, VariantStatus } from '@ecom/types';

@Injectable()
export class VariantsService {
  constructor(@InjectModel(ProductVariant.name) private readonly model: Model<ProductVariantDocument>) {}

  async create(storeId: string, productId: string, dto: CreateVariantDto): Promise<Variant> {
    const doc = await this.model.create({
      storeId,
      productId: new Types.ObjectId(productId),
      ...dto,
      sku: dto.sku.toUpperCase(),
    });
    return doc.toJSON<Variant>();
  }

  async findByProduct(storeId: string, productId: string): Promise<Variant[]> {
    const items = await this.model
      .find({ storeId, productId: new Types.ObjectId(productId) })
      .sort({ createdAt: 1 })
      .exec();
    return items.map((i) => i.toJSON<Variant>());
  }

  async findById(id: string): Promise<Variant> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Variant not found');
    return item.toJSON<Variant>();
  }

  async update(id: string, dto: UpdateVariantDto): Promise<Variant> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.sku) update.sku = dto.sku.toUpperCase();
    const item = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!item) throw new NotFoundException('Variant not found');
    return item.toJSON<Variant>();
  }

  async remove(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async adjustStock(id: string, dto: AdjustStockDto): Promise<Variant> {
    if (dto.absolute) {
      const item = await this.model.findByIdAndUpdate(id, { stock: Math.max(0, dto.quantity) }, { new: true }).exec();
      if (!item) throw new NotFoundException('Variant not found');
      return item.toJSON<Variant>();
    }
    const item = await this.model.findByIdAndUpdate(
      id,
      { $inc: { stock: dto.quantity } },
      { new: true },
    ).exec();
    if (!item) throw new NotFoundException('Variant not found');
    if (item.stock < 0) {
      item.stock = 0;
      await item.save();
    }
    return item.toJSON<Variant>();
  }

  async setStatus(id: string, status: VariantStatus): Promise<Variant> {
    const item = await this.model.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!item) throw new NotFoundException('Variant not found');
    return item.toJSON<Variant>();
  }

  async findBySku(storeId: string, sku: string): Promise<Variant | null> {
    const item = await this.model.findOne({ storeId, sku: sku.toUpperCase() }).exec();
    return item ? item.toJSON<Variant>() : null;
  }

  /** Used by seed to set stock directly without inc. */
  async setStock(id: string, stock: number): Promise<void> {
    await this.model.updateOne({ _id: id }, { stock }).exec();
  }
}
