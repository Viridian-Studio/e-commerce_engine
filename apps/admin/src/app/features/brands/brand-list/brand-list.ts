import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Brand } from '@ecom/types';
import { BrandService } from '../../../core/services/brand.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { extractErrorMessage } from '../../../core/http-error';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { LoadingState } from '../../../shared/loading-state/loading-state';
import { Pagination } from '../../../shared/pagination/pagination';
import { SearchInput } from '../../../shared/search-input/search-input';

@Component({
  selector: 'app-brand-list',
  imports: [RouterLink, StatusBadge, EmptyState, LoadingState, Pagination, SearchInput],
  templateUrl: './brand-list.html',
})
export class BrandList {
  private readonly brandService = inject(BrandService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  protected readonly brands = signal<Brand[]>([]);
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
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.brandService.list({ page: this.page(), search: this.search() });
      this.brands.set(res.data);
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

  protected async remove(brand: Brand): Promise<void> {
    const ok = await this.confirm.confirm({ title: `Delete "${brand.name}"?`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try {
      await this.brandService.remove(brand._id);
      this.notifications.success('Brand deleted');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }
}
