import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { Address, CustomerStatus } from '@ecom/types';

@Schema({ _id: true, timestamps: true })
export class Customer {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: String, required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ type: String, required: true, trim: true })
  firstName: string;

  @Prop({ type: String, required: true, trim: true })
  lastName: string;

  @Prop({ type: String, trim: true })
  phone?: string;

  @Prop({ type: String, enum: CustomerStatus, default: CustomerStatus.ACTIVE })
  status: CustomerStatus;

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        firstName: String,
        lastName: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        phone: String,
        isDefault: Boolean,
      },
    ],
    default: [],
  })
  addresses: Address[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type CustomerDocument = HydratedDocument<Customer>;
export const CustomerSchema = SchemaFactory.createForClass(Customer);
CustomerSchema.index({ storeId: 1, email: 1 }, { unique: true });
