import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ShippingZone } from '@ecom/types';
import { ShippingService } from '../../../core/services/shipping.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { extractErrorMessage } from '../../../core/http-error';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { LoadingState } from '../../../shared/loading-state/loading-state';

@Component({
  selector: 'app-shipping-list',
  imports: [RouterLink, EmptyState, LoadingState],
  templateUrl: './shipping-list.html',
})
export class ShippingList {
  private readonly shippingService = inject(ShippingService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  protected readonly zones = signal<ShippingZone[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    effect(() => {
      if (this.storeContext.currentStoreId()) void this.load();
      else this.loading.set(false);
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.shippingService.list({ limit: 100 });
      this.zones.set(res.data);
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async remove(zone: ShippingZone): Promise<void> {
    const ok = await this.confirm.confirm({ title: `Delete "${zone.name}"?`, confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    try {
      await this.shippingService.remove(zone._id);
      this.notifications.success('Shipping zone deleted');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }
}
