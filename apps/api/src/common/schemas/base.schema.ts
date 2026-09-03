import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Base schema with timestamps. Mongoose manages createdAt/updatedAt.
 */
export abstract class BaseSchema {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export abstract class StoreScopedSchema extends BaseSchema {
  @Prop({ type: String, required: true, index: true })
  storeId: string;
}
