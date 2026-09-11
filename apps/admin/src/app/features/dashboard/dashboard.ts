import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
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
  color: 'brand' | 'success' | 'info' | 'warning';
  changePercent?: number | null;
}

interface ChartPoint {
  x: number;
  y: number;
  date: string;
  revenue: number;
}

const CHART_WIDTH = 600;
const CHART_HEIGHT = 160;
const CHART_TOP_PADDING = 12;
const CHART_BOTTOM_PADDING = 8;

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink, StatusBadge, EmptyState],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);
  protected readonly storeContext = inject(StoreContextService);

  protected readonly stats = signal<DashboardStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly hoveredPointIndex = signal<number | null>(null);

  protected readonly today = new Date();

  protected readonly cards = computed<StatCard[]>(() => {
    const s = this.stats();
    if (!s) return [];
    const currency = s.currency;
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n);
    return [
      {
        label: 'Revenue',
        value: fmt(s.revenue),
        icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
        color: 'brand',
        changePercent: s.revenueChangePercent,
      },
      {
        label: 'Orders',
        value: String(s.orders),
        icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Zm0 0h12M3 6h18M9 10a3 3 0 0 0 6 0',
        color: 'success',
        changePercent: s.ordersChangePercent,
      },
      {
        label: 'Customers',
        value: String(s.customers),
        icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
        color: 'info',
      },
      {
        label: 'Products',
        value: String(s.products),
        icon: 'M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
        color: 'warning',
      },
      {
        label: 'Avg. Order Value',
        value: fmt(s.averageOrderValue),
        icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
        color: 'brand',
      },
    ];
  });

  protected readonly maxStatusCount = computed(() =>
    Math.max(1, ...(this.stats()?.orderStatusBreakdown.map((s) => s.count) ?? [0])),
  );

  protected readonly chartPoints = computed<ChartPoint[]>(() => {
    const series = this.stats()?.salesSeries ?? [];
    if (series.length === 0) return [];
    const max = Math.max(1, ...series.map((p) => p.revenue));
    const usableHeight = CHART_HEIGHT - CHART_TOP_PADDING - CHART_BOTTOM_PADDING;
    return series.map((point, i) => ({
      x: series.length === 1 ? CHART_WIDTH / 2 : (i / (series.length - 1)) * CHART_WIDTH,
      y: CHART_HEIGHT - CHART_BOTTOM_PADDING - (point.revenue / max) * usableHeight,
      date: point.date,
      revenue: point.revenue,
    }));
  });

  protected readonly chartLinePath = computed(() => smoothPath(this.chartPoints()));

  protected readonly chartAreaPath = computed(() => {
    const points = this.chartPoints();
    if (points.length === 0) return '';
    const last = points[points.length - 1];
    const first = points[0];
    return `${smoothPath(points)} L ${last.x} ${CHART_HEIGHT} L ${first.x} ${CHART_HEIGHT} Z`;
  });

  protected readonly chartViewBox = `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`;

  protected readonly hoveredPoint = computed(() => {
    const i = this.hoveredPointIndex();
    return i === null ? null : (this.chartPoints()[i] ?? null);
  });

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

  protected greeting(): string {
    const hour = this.today.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  protected cardColorClasses(color: StatCard['color']): string {
    switch (color) {
      case 'success':
        return 'bg-(--color-success-soft) text-(--color-success)';
      case 'info':
        return 'bg-(--color-info-soft) text-(--color-info)';
      case 'warning':
        return 'bg-(--color-warning-soft) text-(--color-warning)';
      default:
        return 'bg-(--color-brand-soft) text-(--color-brand)';
    }
  }
}

/** Draws a smooth line through the given points using quadratic curves via their midpoints. */
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    d += ` Q ${p0.x} ${p0.y}, ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}
