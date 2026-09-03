import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { ProductStatus } from '@ecom/types';

@Schema({ _id: true, timestamps: true })
export class Collection {
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

  @Prop({ type: String })
  image?: string;

  @Prop({ type: String, enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Prop({ type: { metaTitle: String, metaDescription: String, slug: String }, default: {} })
  seo?: { metaTitle?: string; metaDescription?: string; slug?: string };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type CollectionDocument = HydratedDocument<Collection>;
export const CollectionSchema = SchemaFactory.createForClass(Collection);
CollectionSchema.index({ storeId: 1, slug: 1 }, { unique: true });
