import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Store } from '@ecom/types';
import { StoreService } from '../../../core/services/store.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { extractErrorMessage } from '../../../core/http-error';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { LoadingState } from '../../../shared/loading-state/loading-state';

@Component({
  selector: 'app-store-list',
  imports: [RouterLink, StatusBadge, EmptyState, LoadingState],
  templateUrl: './store-list.html',
})
export class StoreList {
  private readonly storeService = inject(StoreService);
  protected readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  protected readonly stores = signal<Store[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.stores.set(await this.storeService.list());
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async remove(store: Store): Promise<void> {
    const ok = await this.confirm.confirm({
      title: `Delete "${store.name}"?`,
      message: 'This does not delete the store’s products, orders or customers.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await this.storeService.remove(store._id);
      this.notifications.success('Store deleted');
      await this.load();
      await this.storeContext.refresh();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }
}
