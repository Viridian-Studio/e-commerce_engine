import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto, UpdateProductDto, BulkProductStatusDto } from './dto/product.dto';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import { slugify } from '../../common/utils/slug';
import { VariantsService } from '../variants/variants.service';
import type { Product as ProductType, ProductStatus, Paginated } from '@ecom/types';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
    private readonly variantsService: VariantsService,
  ) {}

  async create(storeId: string, dto: CreateProductDto): Promise<ProductType> {
    const slug = dto.slug ? slugify(dto.slug) : slugify(dto.name);
    const doc = await this.model.create({
      storeId,
      ...dto,
      slug,
      brandId: dto.brandId ? new Types.ObjectId(dto.brandId) : null,
      categoryIds: (dto.categoryIds ?? []).map((id) => new Types.ObjectId(id)),
      collectionIds: (dto.collectionIds ?? []).map((id) => new Types.ObjectId(id)),
    });
    return this.findById(doc._id.toString());
  }

  async findAll(storeId: string, query: ListQueryDto): Promise<Paginated<ProductType>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (query.status) filter.status = query.status;
    if (query.brandId) filter.brandId = new Types.ObjectId(query.brandId);
    if (query.categoryId) filter.categoryIds = new Types.ObjectId(query.categoryId);
    if (query.collectionId) filter.collectionIds = new Types.ObjectId(query.collectionId);
    const sort: Record<string, 1 | -1> = { [sortField ?? 'createdAt']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    const enriched = await Promise.all(items.map((p) => this.enrich(p)));
    return paginate(enriched, page, limit, total);
  }

  async findById(id: string): Promise<ProductType> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Product not found');
    return this.enrich(item);
  }

  async findBySlug(storeId: string, slug: string): Promise<ProductType | null> {
    const item = await this.model.findOne({ storeId, slug }).exec();
    if (!item) return null;
    return this.enrich(item);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductType> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.slug) update.slug = slugify(dto.slug);
    else if (dto.name) update.slug = slugify(dto.name);
    if (dto.brandId !== undefined) update.brandId = dto.brandId ? new Types.ObjectId(dto.brandId) : null;
    if (dto.categoryIds) update.categoryIds = dto.categoryIds.map((id) => new Types.ObjectId(id));
    if (dto.collectionIds) update.collectionIds = dto.collectionIds.map((id) => new Types.ObjectId(id));
    const item = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!item) throw new NotFoundException('Product not found');
    return this.enrich(item);
  }

  async bulkStatus(dto: BulkProductStatusDto): Promise<{ modified: number }> {
    const res = await this.model
      .updateMany({ _id: { $in: dto.ids.map((id) => new Types.ObjectId(id)) } }, { status: dto.status })
      .exec();
    return { modified: res.modifiedCount };
  }

  async setStatus(id: string, status: ProductStatus): Promise<ProductType> {
    const item = await this.model.findByIdAndUpdate(id, { status }, { new: true }).exec();
    if (!item) throw new NotFoundException('Product not found');
    return this.enrich(item);
  }

  async remove(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
    // Cascade delete variants
    const variants = await this.variantsService.findByProduct('', id);
    for (const v of variants) {
      await this.variantsService.remove(v._id.toString());
    }
  }

  async countByStore(storeId: string): Promise<number> {
    return this.model.countDocuments({ storeId }).exec();
  }

  async topProducts(storeId: string, limit: number): Promise<
    { productId: string; name: string; units: number; revenue: number }[]
  > {
    // Delegated to orders aggregation in dashboard; here return empty fallback.
    return [];
  }

  private async enrich(doc: ProductDocument): Promise<ProductType> {
    const variants = await this.variantsService.findByProduct(doc.storeId, doc._id.toString());
    const json = doc.toJSON<ProductType>();
    return { ...json, variants };
  }
}
