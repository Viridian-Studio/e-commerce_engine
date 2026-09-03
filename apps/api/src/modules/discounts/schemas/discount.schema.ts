import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum DiscountStatus {
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired',
  DISABLED = 'disabled',
}

@Schema({ _id: true, timestamps: true })
export class Discount {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: String, required: true, trim: true })
  code: string;

  @Prop({ type: String, required: true })
  description?: string;

  @Prop({ type: String, enum: DiscountType, required: true })
  type: DiscountType;

  @Prop({ type: Number, required: true })
  value: number;

  @Prop({ type: Number, default: null })
  minSubtotal?: number | null;

  @Prop({ type: Number, default: null })
  maxDiscount?: number | null;

  @Prop({ type: Number, default: null })
  usageLimit?: number | null;

  @Prop({ type: Number, default: 0 })
  usageCount: number;

  @Prop({ type: Date, default: null })
  startsAt?: Date | null;

  @Prop({ type: Date, default: null })
  endsAt?: Date | null;

  @Prop({ type: String, enum: DiscountStatus, default: DiscountStatus.ACTIVE })
  status: DiscountStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type DiscountDocument = HydratedDocument<Discount>;
export const DiscountSchema = SchemaFactory.createForClass(Discount);
DiscountSchema.index({ storeId: 1, code: 1 }, { unique: true });
