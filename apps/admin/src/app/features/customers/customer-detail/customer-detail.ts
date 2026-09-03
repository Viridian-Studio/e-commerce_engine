import { Component, computed, effect, inject, input, signal } from '@angular/core';
import type { Customer, Order } from '@ecom/types';
import { CustomerService } from '../../../core/services/customer.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-customer-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe, StatusBadge, EmptyState],
  templateUrl: './customer-detail.html',
})
export class CustomerDetail {
  private readonly customerService = inject(CustomerService);
  private readonly orderService = inject(OrderService);
  private readonly notifications = inject(NotificationService);

  readonly id = input.required<string>();

  protected readonly customer = signal<Customer | null>(null);
  protected readonly orders = signal<Order[]>([]);
  protected readonly loading = signal(true);

  protected readonly totalSpent = computed(() =>
    this.orders()
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totals.total, 0),
  );
  protected readonly currency = computed(() => this.orders()[0]?.totals.currency ?? 'USD');

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const [customer, orders] = await Promise.all([
        this.customerService.get(id),
        this.orderService.list({ customerId: id, limit: 50, sort: 'createdAt', order: 'desc' }),
      ]);
      this.customer.set(customer);
      this.orders.set(orders.data);
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }
}
