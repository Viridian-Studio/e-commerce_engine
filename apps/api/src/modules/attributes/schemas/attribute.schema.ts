import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { AttributeValue } from '@ecom/types';

@Schema({ _id: true, timestamps: true })
export class Attribute {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  slug: string;

  @Prop({
    type: [{ value: String, label: String }],
    default: [],
  })
  values: AttributeValue[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type AttributeDocument = HydratedDocument<Attribute>;
export const AttributeSchema = SchemaFactory.createForClass(Attribute);
AttributeSchema.index({ storeId: 1, slug: 1 }, { unique: true });
