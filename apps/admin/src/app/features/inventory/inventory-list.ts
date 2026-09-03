import { Component, effect, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import type { ProductVariant } from '@ecom/types';
import { InventoryService, InventorySummary } from '../../core/services/inventory.service';
import { StoreContextService } from '../../core/store-context.service';
import { NotificationService } from '../../core/notification.service';
import { extractErrorMessage } from '../../core/http-error';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { LoadingState } from '../../shared/loading-state/loading-state';
import { Pagination } from '../../shared/pagination/pagination';
import { SearchInput } from '../../shared/search-input/search-input';

type InventoryRow = ProductVariant & { productName?: string };

@Component({
  selector: 'app-inventory-list',
  imports: [JsonPipe, EmptyState, LoadingState, Pagination, SearchInput],
  templateUrl: './inventory-list.html',
})
export class InventoryList {
  private readonly inventoryService = inject(InventoryService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);

  protected readonly rows = signal<InventoryRow[]>([]);
  protected readonly summary = signal<InventorySummary | null>(null);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly page = signal(1);
  protected readonly search = signal('');
  protected readonly loading = signal(true);

  constructor() {
    effect(() => {
      this.search();
      this.page();
      if (this.storeContext.currentStoreId()) void this.load();
      else this.loading.set(false);
    });

    effect(() => {
      if (this.storeContext.currentStoreId()) {
        void this.inventoryService.summary().then((s) => this.summary.set(s));
      }
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.inventoryService.list({ page: this.page(), search: this.search(), sort: 'stock', order: 'asc' });
      this.rows.set(res.data);
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

  protected stockClass(stock: number): string {
    if (stock === 0) return 'text-(--color-danger)';
    if (stock <= 5) return 'text-(--color-warning)';
    return 'text-(--color-text)';
  }
}
