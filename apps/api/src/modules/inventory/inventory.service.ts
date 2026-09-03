import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductVariant, ProductVariantDocument } from '../variants/schemas/variant.schema';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import type { Paginated, ProductVariant as Variant } from '@ecom/types';

@Injectable()
export class InventoryService {
  constructor(@InjectModel(ProductVariant.name) private readonly model: Model<ProductVariantDocument>) {}

  async list(storeId: string, query: ListQueryDto): Promise<Paginated<Variant & { productName?: string }>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) filter.sku = { $regex: search, $options: 'i' };
    if (query.status) filter.status = query.status;
    const sort: Record<string, 1 | -1> = { [sortField ?? 'sku']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return paginate(
      items.map((i) => i.toJSON<Variant & { productName?: string }>()),
      page,
      limit,
      total,
    );
  }

  async lowStock(storeId: string, threshold = 5): Promise<Variant[]> {
    const items = await this.model.find({ storeId, stock: { $lte: threshold } }).sort({ stock: 1 }).exec();
    return items.map((i) => i.toJSON<Variant>());
  }

  async summary(storeId: string): Promise<{
    totalSkus: number;
    totalStock: number;
    lowStock: number;
    outOfStock: number;
  }> {
    const [agg] = await this.model
      .aggregate<{
        totalSkus: number;
        totalStock: number;
        lowStock: number;
        outOfStock: number;
      }>([
        { $match: { storeId } },
        {
          $group: {
            _id: null,
            totalSkus: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            lowStock: { $sum: { $cond: [{ $lte: ['$stock', 5] }, 1, 0] } },
            outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
          },
        },
      ])
      .exec();
    return (
      agg ?? {
        totalSkus: 0,
        totalStock: 0,
        lowStock: 0,
        outOfStock: 0,
      }
    );
  }
}
