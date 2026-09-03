import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

export enum ContentType {
  PAGE = 'page',
  BANNER = 'banner',
  BLOCK = 'block',
}

@Schema({ _id: true, timestamps: true })
export class Content {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  slug: string;

  @Prop({ type: String, enum: ContentType, default: ContentType.PAGE })
  type: ContentType;

  @ApiPropertyOptional()
  @Prop({ type: String })
  body?: string;

  @ApiPropertyOptional()
  @Prop({ type: String })
  imageUrl?: string;

  @ApiPropertyOptional()
  @Prop({ type: String })
  linkUrl?: string;

  @Prop({ type: Boolean, default: true })
  published: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type ContentDocument = HydratedDocument<Content>;
export const ContentSchema = SchemaFactory.createForClass(Content);
ContentSchema.index({ storeId: 1, slug: 1 }, { unique: true });
