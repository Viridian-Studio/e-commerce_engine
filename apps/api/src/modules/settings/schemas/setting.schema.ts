import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: true, timestamps: true, collection: 'store_settings' })
export class StoreSetting {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, index: true })
  storeId: string;

  @Prop({ type: String, required: true, trim: true })
  key: string;

  @Prop({ type: 'Mixed', required: true })
  value: unknown;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type StoreSettingDocument = HydratedDocument<StoreSetting>;
export const StoreSettingSchema = SchemaFactory.createForClass(StoreSetting);
StoreSettingSchema.index({ storeId: 1, key: 1 }, { unique: true });
