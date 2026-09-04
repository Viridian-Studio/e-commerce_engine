import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntegrationsController } from './integrations.controller';
import { ViridianService } from './viridian.service';
import { ViridianImportService } from './viridian-import.service';
import { ProductVariant, ProductVariantSchema } from '../variants/schemas/variant.schema';
import { ProductsModule } from '../products/products.module';
import { VariantsModule } from '../variants/variants.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProductVariant.name, schema: ProductVariantSchema }]),
    ProductsModule,
    VariantsModule,
    StoresModule,
  ],
  controllers: [IntegrationsController],
  providers: [ViridianService, ViridianImportService],
  exports: [ViridianService],
})
export class IntegrationsModule {}
