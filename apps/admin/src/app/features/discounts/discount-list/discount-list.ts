import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Discount } from '@ecom/types';
import { DiscountService } from '../../../core/services/discount.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { extractErrorMessage } from '../../../core/http-error';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { LoadingState } from '../../../shared/loading-state/loading-state';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-discount-list',
  imports: [RouterLink, StatusBadge, EmptyState, LoadingState, Pagination],
  templateUrl: './discount-list.html',
})
export class DiscountList {
  private readonly discountService = inject(DiscountService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  protected readonly discounts = signal<Discount[]>([]);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly page = signal(1);
  protected readonly loading = signal(true);

  constructor() {
    effect(() => {
      this.page();
      if (this.storeContext.currentStoreId()) void this.load();
      else this.loading.set(false);
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.discountService.list({ page: this.page() });
      this.discounts.set(res.data);
      this.total.set(res.meta.total);
      this.totalPages.set(res.meta.totalPages);
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected describe(d: Discount): string {
    return d.type === 'percentage' ? `${d.value}% off` : `${d.value} off`;
  }

  protected async remove(discount: Discount): Promise<void> {
    const ok = await this.confirm.confirm({ title: `Delete "${discount.code}"?`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try {
      await this.discountService.remove(discount._id);
      this.notifications.success('Discount deleted');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }
}
