import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { ImageRef, VariantAttributeSelection, VariantStatus } from '@ecom/types';

@Schema({ _id: true, timestamps: true })
export class ProductVariant {
  @ApiProperty()
  _id: string;

  @Prop({ type: Types.ObjectId, required: true })
  productId: Types.ObjectId;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: String, required: true, trim: true, index: true })
  sku: string;

  @Prop({ type: String, trim: true })
  name?: string;

  @Prop({ type: Number, required: true, default: 0 })
  price: number;

  @Prop({ type: Number, default: null })
  compareAtPrice?: number | null;

  @Prop({ type: String, required: true, default: 'USD' })
  currency: string;

  @Prop({ type: Number, required: true, default: 0 })
  stock: number;

  @Prop({
    type: [{ attributeSlug: String, value: String }],
    default: [],
  })
  attributes: VariantAttributeSelection[];

  @Prop({
    type: [{ url: String, alt: String, position: Number }],
    default: [],
  })
  images: ImageRef[];

  @Prop({ type: String, enum: VariantStatus, default: VariantStatus.ACTIVE })
  status: VariantStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type ProductVariantDocument = HydratedDocument<ProductVariant>;
export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);
ProductVariantSchema.index({ storeId: 1, sku: 1 }, { unique: true });
ProductVariantSchema.index({ productId: 1 });
