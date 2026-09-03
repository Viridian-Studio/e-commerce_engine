import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import {
  Address,
  FulfillmentStatus,
  OrderEvent,
  OrderLineItem,
  OrderStatus,
  OrderTotals,
  PaymentStatus,
} from '@ecom/types';

@Schema({ _id: true, timestamps: true, collection: 'orders' })
export class Order {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  number: string;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  customerId?: Types.ObjectId | null;

  @Prop({
    type: { name: String, email: String, phone: String },
    default: {},
  })
  customer?: { name: string; email: string; phone?: string };

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        productId: Types.ObjectId,
        variantId: Types.ObjectId,
        name: String,
        sku: String,
        quantity: Number,
        price: Number,
        total: Number,
        image: String,
      },
    ],
    default: [],
  })
  items: OrderLineItem[];

  @Prop({
    type: {
      subtotal: Number,
      discount: Number,
      shipping: Number,
      tax: Number,
      total: Number,
      currency: String,
    },
    required: true,
  })
  totals: OrderTotals;

  @Prop({ type: Object, default: null })
  shippingAddress?: Address | null;

  @Prop({ type: Object, default: null })
  billingAddress?: Address | null;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING, index: true })
  status: OrderStatus;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING, index: true })
  paymentStatus: PaymentStatus;

  @Prop({ type: String, enum: FulfillmentStatus, default: FulfillmentStatus.UNFULFILLED })
  fulfillmentStatus: FulfillmentStatus;

  @Prop({
    type: { provider: String, transactionId: String, method: String },
    default: {},
  })
  payment?: { provider: string; transactionId?: string; method?: string };

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        status: String,
        note: String,
        createdAt: Date,
      },
    ],
    default: [],
  })
  timeline: OrderEvent[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ storeId: 1, createdAt: -1 });
OrderSchema.index({ storeId: 1, customerId: 1 });
