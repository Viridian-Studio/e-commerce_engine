import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Order, Paginated } from '@ecom/types';
import { STOREFRONT_CONFIG } from '../config/storefront.config';

/**
 * Storefront order service — fetches the authenticated customer's orders
 * from the engine. Requires a customer JWT (sent automatically by the
 * auth interceptor).
 */
@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly base = STOREFRONT_CONFIG.apiBase;

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadMyOrders(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<Paginated<Order>>(`${this.base}/orders`, {
          params: { limit: '50', sort: 'createdAt', order: 'desc' },
        }),
      );
      this.orders.set(res.data);
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.loading.set(false);
    }
  }
}
