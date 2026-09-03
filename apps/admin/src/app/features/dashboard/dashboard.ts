import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { DashboardStats } from '@ecom/types';
import { DashboardService } from '../../core/services/dashboard.service';
import { StoreContextService } from '../../core/store-context.service';
import { StatusBadge } from '../../shared/status-badge/status-badge';
import { EmptyState } from '../../shared/empty-state/empty-state';

interface StatCard {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink, StatusBadge, EmptyState],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  protected readonly storeContext = inject(StoreContextService);

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly loading = signal(true);

  protected readonly cards = computed<StatCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    const currency = s.currency;
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
    return [
      { label: 'Revenue', value: fmt(s.revenue), icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
      { label: 'Orders', value: String(s.orders), icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Zm0 0h12M3 6h18M9 10a3 3 0 0 0 6 0' },
      { label: 'Customers', value: String(s.customers), icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z' },
      { label: 'Products', value: String(s.products), icon: 'M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
      { label: 'Avg. Order Value', value: fmt(s.averageOrderValue), icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    ];
  });

  protected readonly maxSeriesRevenue = computed(() =>
    Math.max(1, ...(this.stats()?.salesSeries.map((p) => p.revenue) ?? [0])),
  );

  protected readonly maxStatusCount = computed(() =>
    Math.max(1, ...(this.stats()?.orderStatusBreakdown.map((s) => s.count) ?? [0])),
  );

  constructor() {
    effect(() => {
      const storeId = this.storeContext.currentStoreId();
      if (storeId) void this.load();
      else this.loading.set(false);
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.stats.set(await this.dashboardService.getStats());
    } finally {
      this.loading.set(false);
    }
  }

  protected barHeight(revenue: number): string {
    return `${Math.max(4, (revenue / this.maxSeriesRevenue()) * 100)}%`;
  }
}
