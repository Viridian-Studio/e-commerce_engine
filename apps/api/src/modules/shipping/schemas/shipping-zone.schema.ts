import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export enum ShippingRateType {
  FLAT = 'flat',
  FREE = 'free',
  WEIGHT = 'weight',
}

@Schema({ _id: true, timestamps: true })
export class ShippingZone {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: [String], default: [] })
  countries: string[];

  @Prop({
    type: [
      {
        _id: { type: String, auto: true },
        name: String,
        type: { type: String, enum: ShippingRateType },
        price: Number,
        minSubtotal: Number,
        maxSubtotal: Number,
      },
    ],
    default: [],
  })
  rates: {
    name: string;
    type: ShippingRateType;
    price: number;
    minSubtotal?: number;
    maxSubtotal?: number;
  }[];

  @Prop({ type: Boolean, default: true })
  enabled: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type ShippingZoneDocument = HydratedDocument<ShippingZone>;
export const ShippingZoneSchema = SchemaFactory.createForClass(ShippingZone);
ShippingZoneSchema.index({ storeId: 1, name: 1 }, { unique: true });
