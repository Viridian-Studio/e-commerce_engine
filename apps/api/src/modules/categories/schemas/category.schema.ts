import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { CategoryStatus } from '@ecom/types';

@Schema({ _id: true, timestamps: true })
export class Category {
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

  @Prop({ type: Types.ObjectId, default: null, index: true })
  parentId?: Types.ObjectId | null;

  @Prop({ type: String, enum: CategoryStatus, default: CategoryStatus.ACTIVE })
  status: CategoryStatus;

  @Prop({
    type: { metaTitle: String, metaDescription: String, slug: String, keywords: [String] },
    default: {},
  })
  seo?: { metaTitle?: string; metaDescription?: string; slug?: string; keywords?: string[] };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type CategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ storeId: 1, slug: 1 }, { unique: true });
CategorySchema.index({ storeId: 1, status: 1 });
