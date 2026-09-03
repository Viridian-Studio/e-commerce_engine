import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';
import { ProductVariant, ProductVariantSchema } from './schemas/variant.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: ProductVariant.name, schema: ProductVariantSchema }])],
  controllers: [VariantsController],
  providers: [VariantsService],
  exports: [VariantsService],
})
export class VariantsModule {}
