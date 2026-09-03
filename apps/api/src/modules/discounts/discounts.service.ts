import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Discount, DiscountDocument, DiscountType } from './schemas/discount.schema';
import { CreateDiscountDto, UpdateDiscountDto } from './dto/discount.dto';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import { roundMoney } from '../../common/utils/slug';
import type { Discount as SharedDiscount, Paginated } from '@ecom/types';

@Injectable()
export class DiscountsService {
  constructor(@InjectModel(Discount.name) private readonly model: Model<DiscountDocument>) {}

  async create(storeId: string, dto: CreateDiscountDto): Promise<SharedDiscount> {
    const doc = await this.model.create({ storeId, ...dto, code: dto.code.toUpperCase() });
    return doc.toJSON<SharedDiscount>();
  }

  async findAll(storeId: string, query: ListQueryDto): Promise<Paginated<SharedDiscount>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) filter.code = { $regex: search, $options: 'i' };
    if (query.status) filter.status = query.status;
    const sort: Record<string, 1 | -1> = { [sortField ?? 'createdAt']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return paginate(items.map((i) => i.toJSON<SharedDiscount>()), page, limit, total);
  }

  async findById(id: string): Promise<SharedDiscount> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Discount not found');
    return item.toJSON<SharedDiscount>();
  }

  async findByCode(storeId: string, code: string): Promise<Discount | null> {
    return this.model.findOne({ storeId, code: code.toUpperCase() }).exec();
  }

  async update(id: string, dto: UpdateDiscountDto): Promise<SharedDiscount> {
    const update: Record<string, unknown> = { ...dto };
    if (dto.code) update.code = dto.code.toUpperCase();
    const item = await this.model.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!item) throw new NotFoundException('Discount not found');
    return item.toJSON<SharedDiscount>();
  }

  async remove(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  /**
   * Validates a code against a subtotal and computes the discount amount,
   * without recording a usage. Shared by the live preview and the final
   * apply so both enforce identical rules.
   */
  private async validateAndCompute(storeId: string, code: string, subtotal: number): Promise<{ amount: number; discount: Discount }> {
    const discount = await this.findByCode(storeId, code);
    if (!discount) throw new NotFoundException('Discount code not found');
    if (discount.status !== 'active') throw new BadRequestException('Discount is not active');
    const now = new Date();
    if (discount.startsAt && now < discount.startsAt) throw new BadRequestException('Discount not started yet');
    if (discount.endsAt && now > discount.endsAt) throw new BadRequestException('Discount has expired');
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit)
      throw new BadRequestException('Discount usage limit reached');
    if (discount.minSubtotal && subtotal < discount.minSubtotal)
      throw new BadRequestException(`Minimum subtotal ${discount.minSubtotal} required`);

    let amount: number;
    if (discount.type === DiscountType.PERCENTAGE) {
      amount = (subtotal * discount.value) / 100;
      if (discount.maxDiscount) amount = Math.min(amount, discount.maxDiscount);
    } else {
      amount = Math.min(discount.value, subtotal);
    }
    amount = roundMoney(amount);

    return { amount, discount };
  }

  /**
   * Read-only preview for the storefront cart/checkout UI — same validation
   * as applyCode, but never records a usage (usage is only ever recorded once
   * an order is actually placed).
   */
  previewCode(storeId: string, code: string, subtotal: number): Promise<{ amount: number; discount: Discount }> {
    return this.validateAndCompute(storeId, code, subtotal);
  }

  /**
   * Apply a discount code to a subtotal. Returns the discount amount (>=0).
   * Validates status, date window, usage limits and minimum subtotal, and
   * records a usage — call this only when an order is actually being placed.
   */
  async applyCode(storeId: string, code: string, subtotal: number): Promise<{ amount: number; discount: Discount }> {
    const result = await this.validateAndCompute(storeId, code, subtotal);
    await this.model.updateOne({ _id: result.discount._id }, { $inc: { usageCount: 1 } }).exec();
    return result;
  }
}
