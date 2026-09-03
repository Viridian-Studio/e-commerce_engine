import { Component, effect, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Order } from '@ecom/types';
import { OrderService } from '../../../core/services/order.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { LoadingState } from '../../../shared/loading-state/loading-state';
import { Pagination } from '../../../shared/pagination/pagination';
import { SearchInput } from '../../../shared/search-input/search-input';
import { Select } from '../../../shared/select/select';

@Component({
  selector: 'app-order-list',
  imports: [RouterLink, CurrencyPipe, DatePipe, StatusBadge, EmptyState, LoadingState, Pagination, SearchInput, Select],
  templateUrl: './order-list.html',
})
export class OrderList {
  private readonly orderService = inject(OrderService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);

  protected readonly orders = signal<Order[]>([]);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly page = signal(1);
  protected readonly search = signal('');
  protected readonly status = signal('');
  protected readonly loading = signal(true);

  protected readonly statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  constructor() {
    effect(() => {
      this.search();
      this.status();
      this.page();
      if (this.storeContext.currentStoreId()) void this.load();
      else this.loading.set(false);
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.orderService.list({
        page: this.page(),
        search: this.search(),
        status: this.status(),
        sort: 'createdAt',
        order: 'desc',
      });
      this.orders.set(res.data);
      this.total.set(res.meta.total);
      this.totalPages.set(res.meta.totalPages);
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected onSearch(value: string): void {
    this.page.set(1);
    this.search.set(value);
  }

  protected onStatusFilter(value: string): void {
    this.page.set(1);
    this.status.set(value);
  }

  protected itemCount(order: Order): number {
    return order.items.reduce((sum, i) => sum + i.quantity, 0);
  }
}
