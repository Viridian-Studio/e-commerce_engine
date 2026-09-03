import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShippingZone, ShippingZoneDocument, ShippingRateType } from './schemas/shipping-zone.schema';
import { CreateShippingZoneDto, UpdateShippingZoneDto } from './dto/shipping.dto';
import { ListQueryDto, paginate, toQuery } from '../../common/dto/list-query.dto';
import { roundMoney } from '../../common/utils/slug';
import type { Paginated, ShippingZone as SharedShippingZone } from '@ecom/types';

/**
 * Shipping provider interface for future external integrations.
 */
export interface ShippingProvider {
  readonly name: string;
  rate(params: { country: string; subtotal: number; weight?: number }): Promise<{ price: number; name: string }>;
}

@Injectable()
export class ShippingService {
  constructor(@InjectModel(ShippingZone.name) private readonly model: Model<ShippingZoneDocument>) {}

  async create(storeId: string, dto: CreateShippingZoneDto): Promise<SharedShippingZone> {
    const doc = await this.model.create({ storeId, ...dto });
    return doc.toJSON<SharedShippingZone>();
  }

  async findAll(storeId: string, query: ListQueryDto): Promise<Paginated<SharedShippingZone>> {
    const { page, limit, search, sortField, sortOrder } = toQuery(query);
    const filter: Record<string, unknown> = { storeId };
    if (search) filter.name = { $regex: search, $options: 'i' };
    const sort: Record<string, 1 | -1> = { [sortField ?? 'createdAt']: sortOrder };
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return paginate(items.map((i) => i.toJSON<SharedShippingZone>()), page, limit, total);
  }

  async findById(id: string): Promise<SharedShippingZone> {
    const item = await this.model.findById(id).exec();
    if (!item) throw new NotFoundException('Shipping zone not found');
    return item.toJSON<SharedShippingZone>();
  }

  async update(id: string, dto: UpdateShippingZoneDto): Promise<SharedShippingZone> {
    const item = await this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!item) throw new NotFoundException('Shipping zone not found');
    return item.toJSON<SharedShippingZone>();
  }

  async remove(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  /**
   * Compute shipping cost for a cart given country + subtotal.
   * Picks the first matching zone/rate. Returns 0 if none match (free).
   */
  async computeRate(storeId: string, country: string, subtotal: number): Promise<{ price: number; name: string }> {
    const zones = await this.model.find({ storeId, enabled: true }).exec();
    for (const zone of zones) {
      const matchesCountry = zone.countries.length === 0 || zone.countries.includes(country);
      if (!matchesCountry) continue;
      for (const rate of zone.rates) {
        const minOk = rate.minSubtotal == null || subtotal >= rate.minSubtotal;
        const maxOk = rate.maxSubtotal == null || subtotal <= rate.maxSubtotal;
        if (!minOk || !maxOk) continue;
        if (rate.type === ShippingRateType.FREE) return { price: 0, name: rate.name };
        return { price: roundMoney(rate.price), name: rate.name };
      }
    }
    return { price: 0, name: 'Free shipping' };
  }
}
