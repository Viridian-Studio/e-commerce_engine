import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ReturnType {
  REFUND = 'refund',
  EXCHANGE = 'exchange',
}

@Schema({ _id: true, timestamps: true, collection: 'returns' })
export class ReturnRequest {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ type: String, required: true })
  number: string;

  @Prop({ type: String, enum: ReturnType, default: ReturnType.REFUND })
  type: ReturnType;

  @Prop({ type: String, enum: ReturnStatus, default: ReturnStatus.REQUESTED, index: true })
  status: ReturnStatus;

  @Prop({ type: String })
  reason?: string;

  @Prop({
    type: [
      {
        productId: Types.ObjectId,
        variantId: Types.ObjectId,
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    default: [],
  })
  items: {
    productId: Types.ObjectId;
    variantId: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
  }[];

  @Prop({ type: Number, default: 0 })
  refundAmount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type ReturnRequestDocument = HydratedDocument<ReturnRequest>;
export const ReturnRequestSchema = SchemaFactory.createForClass(ReturnRequest);
ReturnRequestSchema.index({ storeId: 1, orderId: 1 });
