import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: true, timestamps: true, collection: 'carts' })
export class Cart {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: String, unique: true, sparse: true, index: true })
  token?: string;

  @Prop({ type: Types.ObjectId, default: null, index: true })
  customerId?: Types.ObjectId | null;

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
        image: String,
      },
    ],
    default: [],
  })
  items: {
    productId: Types.ObjectId;
    variantId?: Types.ObjectId | null;
    name: string;
    sku?: string;
    quantity: number;
    price: number;
    image?: string;
  }[];

  @Prop({ type: String, default: 'USD' })
  currency: string;

  @ApiPropertyOptional()
  @Prop({ type: Object, default: null })
  shippingAddress?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type CartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);
CartSchema.index({ storeId: 1, customerId: 1 }, { sparse: true });
