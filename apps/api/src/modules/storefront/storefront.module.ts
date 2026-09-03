import { Module } from '@nestjs/common';
import { StorefrontController } from './storefront.controller';
import { StorefrontService } from './storefront.service';
import { StoresModule } from '../stores/stores.module';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { CollectionsModule } from '../collections/collections.module';
import { CartsModule } from '../carts/carts.module';
import { OrdersModule } from '../orders/orders.module';
import { CustomersModule } from '../customers/customers.module';
import { BrandsModule } from '../brands/brands.module';
import { ShippingModule } from '../shipping/shipping.module';
import { DiscountsModule } from '../discounts/discounts.module';

@Module({
  imports: [
    StoresModule,
    ProductsModule,
    CategoriesModule,
    CollectionsModule,
    BrandsModule,
    CartsModule,
    OrdersModule,
    CustomersModule,
    ShippingModule,
    DiscountsModule,
  ],
  controllers: [StorefrontController],
  providers: [StorefrontService],
})
export class StorefrontModule {}
