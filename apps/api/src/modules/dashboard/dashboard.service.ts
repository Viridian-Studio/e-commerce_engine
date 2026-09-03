import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { StoresService } from '../stores/stores.service';
import { roundMoney } from '../../common/utils/slug';
import type { DashboardStats } from '@ecom/types';

@Injectable()
export class DashboardService {
  constructor(
    private readonly orders: OrdersService,
    private readonly products: ProductsService,
    private readonly customers: CustomersService,
    private readonly stores: StoresService,
  ) {}

  async getStats(storeId: string): Promise<DashboardStats> {
    const store = await this.stores.findById(storeId).catch(() => null);
    const currency = store?.currency ?? 'USD';

    const [revenue, ordersCount, productsCount, customersCount, salesSeries, statusBreakdown, topProducts, recentOrders] =
      await Promise.all([
        this.orders.revenueByStore(storeId),
        this.orders.countByStore(storeId),
        this.products.countByStore(storeId),
        this.customers.countByStore(storeId),
        this.orders.salesSeries(storeId, 30),
        this.orders.orderStatusBreakdown(storeId),
        this.orders.topProducts(storeId, 5),
        this.orders.recentOrders(storeId, 8),
      ]);

    const averageOrderValue = ordersCount > 0 ? roundMoney(revenue / ordersCount) : 0;

    return {
      revenue: roundMoney(revenue),
      orders: ordersCount,
      customers: customersCount,
      products: productsCount,
      averageOrderValue,
      currency,
      salesSeries,
      topProducts,
      orderStatusBreakdown: statusBreakdown,
      recentOrders,
    };
  }
}
