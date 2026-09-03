import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { ProductVariant, ProductVariantSchema } from '../variants/schemas/variant.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ProductVariant.name, schema: ProductVariantSchema }])],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
