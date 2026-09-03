import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Collection } from '@ecom/types';
import { CollectionService } from '../../../core/services/collection.service';
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
  selector: 'app-collection-list',
  imports: [RouterLink, StatusBadge, EmptyState, LoadingState, Pagination, SearchInput],
  templateUrl: './collection-list.html',
})
export class CollectionList {
  private readonly collectionService = inject(CollectionService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  protected readonly collections = signal<Collection[]>([]);
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
      const res = await this.collectionService.list({ page: this.page(), search: this.search() });
      this.collections.set(res.data);
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

  protected async remove(collection: Collection): Promise<void> {
    const ok = await this.confirm.confirm({ title: `Delete "${collection.name}"?`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try {
      await this.collectionService.remove(collection._id);
      this.notifications.success('Collection deleted');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }
}
