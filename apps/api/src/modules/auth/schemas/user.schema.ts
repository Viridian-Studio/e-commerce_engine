import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { AdminRole } from '@ecom/types';

@Schema({ _id: true, timestamps: true })
export class User {
  @ApiProperty()
  _id: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({
    type: String,
    required: true,
    enum: AdminRole,
    default: AdminRole.STAFF,
    index: true,
  })
  role: AdminRole;

  @Prop({ type: [String], default: [] })
  storeIds: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    ret._id = ret._id?.toString();
    delete (ret as unknown as Record<string, unknown>).passwordHash;
    return ret;
  },
});
