import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Content } from '@ecom/types';
import { ContentService } from '../../../core/services/content.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { extractErrorMessage } from '../../../core/http-error';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { LoadingState } from '../../../shared/loading-state/loading-state';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-content-list',
  imports: [RouterLink, EmptyState, LoadingState, Pagination],
  templateUrl: './content-list.html',
})
export class ContentList {
  private readonly contentService = inject(ContentService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  protected readonly items = signal<Content[]>([]);
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
      const res = await this.contentService.list({ page: this.page() });
      this.items.set(res.data);
      this.total.set(res.meta.total);
      this.totalPages.set(res.meta.totalPages);
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async remove(item: Content): Promise<void> {
    const ok = await this.confirm.confirm({ title: `Delete "${item.title}"?`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try {
      await this.contentService.remove(item._id);
      this.notifications.success('Content deleted');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }
}
