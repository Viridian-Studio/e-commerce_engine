import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [OrdersModule, ProductsModule, CustomersModule, StoresModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
