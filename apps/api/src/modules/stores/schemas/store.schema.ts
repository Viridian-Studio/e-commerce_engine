import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { StoreStatus, StoreThemeConfig } from '@ecom/types';

@Schema({ _id: true, timestamps: true })
export class Store {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true, index: true })
  slug: string;

  @Prop({ type: String, trim: true })
  domain?: string;

  @Prop({ type: String, required: true, default: 'USD' })
  currency: string;

  @Prop({ type: String, required: true, default: 'en-US' })
  locale: string;

  @Prop({ type: String, required: true, default: 'UTC' })
  timezone: string;

  @Prop({ type: String, enum: StoreStatus, default: StoreStatus.ACTIVE, index: true })
  status: StoreStatus;

  @Prop({ type: String, trim: true })
  contactEmail?: string;

  @Prop({
    type: {
      primaryColor: { type: String },
      accentColor: { type: String },
      logoUrl: { type: String },
      faviconUrl: { type: String },
    },
    default: {},
  })
  theme: StoreThemeConfig;

  @Prop({ type: Object, default: {} })
  settings: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type StoreDocument = HydratedDocument<Store>;
export const StoreSchema = SchemaFactory.createForClass(Store);
StoreSchema.index({ domain: 1 }, { unique: true, sparse: true });
