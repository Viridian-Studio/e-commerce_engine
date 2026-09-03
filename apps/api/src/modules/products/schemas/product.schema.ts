import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { ImageRef, ProductStatus, SeoFields } from '@ecom/types';

@Schema({ _id: true, timestamps: true })
export class Product {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  slug: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.DRAFT, index: true })
  status: ProductStatus;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  brandId?: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], default: [], index: true })
  categoryIds: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], default: [] })
  collectionIds: Types.ObjectId[];

  @Prop({
    type: [{ url: String, alt: String, position: Number }],
    default: [],
  })
  images: ImageRef[];

  @Prop({ type: Number, required: true, default: 0 })
  basePrice: number;

  @Prop({ type: Number, default: null })
  compareAtPrice?: number | null;

  @Prop({ type: String, required: true, default: 'USD' })
  currency: string;

  @Prop({
    type: { metaTitle: String, metaDescription: String, slug: String, keywords: [String] },
    default: {},
  })
  seo?: SeoFields;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);
ProductSchema.index({ storeId: 1, slug: 1 }, { unique: true });
ProductSchema.index({ storeId: 1, status: 1 });
ProductSchema.index({ storeId: 1, categoryIds: 1 });
ProductSchema.index({ name: 'text', description: 'text' });
