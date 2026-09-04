import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductStatus, VariantStatus } from '@ecom/types';
import { ProductVariant, ProductVariantDocument } from '../variants/schemas/variant.schema';
import { ProductsService } from '../products/products.service';
import { VariantsService } from '../variants/variants.service';
import { StoresService } from '../stores/stores.service';
import { ViridianService } from './viridian.service';

export interface ViridianImportResult {
  imported: number;
  skipped: number;
  skippedSkus: string[];
}

/**
 * Creates draft products (basePrice/price = 0) from selected Viridian
 * Warehouse inventory items. The warehouse has no pricing data, so the
 * merchant fills in price/description/images before publishing. Items whose
 * SKU is already used by a variant in this store are skipped — that's the
 * re-import idempotency check, since we don't keep a separate import map.
 */
@Injectable()
export class ViridianImportService {
  constructor(
    private readonly viridian: ViridianService,
    private readonly products: ProductsService,
    private readonly variants: VariantsService,
    private readonly stores: StoresService,
    @InjectModel(ProductVariant.name) private readonly variantModel: Model<ProductVariantDocument>,
  ) {}

  async import(storeId: string, apiKey: string, itemIds: string[]): Promise<ViridianImportResult> {
    const [store, allItems] = await Promise.all([
      this.stores.findById(storeId),
      this.viridian.listInventory(apiKey),
    ]);

    const selected = allItems.filter((item) => itemIds.includes(item.id));
    const existingSkus = new Set(
      (
        await this.variantModel
          .find({ storeId, sku: { $in: selected.map((item) => item.sku.toUpperCase()) } })
          .select('sku')
          .lean()
          .exec()
      ).map((variant) => variant.sku),
    );

    let imported = 0;
    const skippedSkus: string[] = [];

    for (const item of selected) {
      if (existingSkus.has(item.sku.toUpperCase())) {
        skippedSkus.push(item.sku);
        continue;
      }

      const product = await this.products.create(storeId, {
        name: item.name,
        basePrice: 0,
        currency: store.currency,
        status: ProductStatus.DRAFT,
      });
      await this.variants.create(storeId, product._id, {
        sku: item.sku,
        price: 0,
        currency: store.currency,
        stock: item.availableQuantity,
        status: VariantStatus.DRAFT,
      });
      imported += 1;
    }

    return { imported, skipped: skippedSkus.length, skippedSkus };
  }
}
