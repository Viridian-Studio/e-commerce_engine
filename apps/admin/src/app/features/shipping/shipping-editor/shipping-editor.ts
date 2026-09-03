import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { ShippingRateType } from '@ecom/types';
import { ShippingService } from '../../../core/services/shipping.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';

interface RateForm {
  name: string;
  type: ShippingRateType;
  price: number;
  minSubtotal: number | null;
  maxSubtotal: number | null;
}

interface ZoneForm {
  name: string;
  countries: string;
  enabled: boolean;
  rates: RateForm[];
}

function emptyForm(): ZoneForm {
  return { name: '', countries: '', enabled: true, rates: [] };
}

@Component({
  selector: 'app-shipping-editor',
  imports: [FormsModule, RouterLink],
  templateUrl: './shipping-editor.html',
})
export class ShippingEditor {
  private readonly shippingService = inject(ShippingService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  protected readonly isNew = computed(() => !this.id());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected form: ZoneForm = emptyForm();

  constructor() {
    effect(() => {
      const id = this.id();
      if (this.storeContext.currentStoreId() && id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const z = await this.shippingService.get(id);
      this.form = {
        name: z.name,
        countries: z.countries.join(', '),
        enabled: z.enabled,
        rates: z.rates.map((r) => ({ ...r, minSubtotal: r.minSubtotal ?? null, maxSubtotal: r.maxSubtotal ?? null })),
      };
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected addRate(): void {
    this.form.rates = [
      ...this.form.rates,
      { name: '', type: 'flat' as ShippingRateType, price: 0, minSubtotal: null, maxSubtotal: null },
    ];
  }

  protected removeRate(index: number): void {
    this.form.rates = this.form.rates.filter((_, i) => i !== index);
  }

  protected async save(): Promise<void> {
    if (!this.form.name.trim()) {
      this.notifications.error('Name is required');
      return;
    }
    this.saving.set(true);
    try {
      const dto = {
        name: this.form.name,
        countries: this.form.countries
          .split(',')
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean),
        enabled: this.form.enabled,
        rates: this.form.rates,
      };
      if (this.isNew()) {
        await this.shippingService.create(dto);
        this.notifications.success('Shipping zone created');
      } else {
        await this.shippingService.update(this.id()!, dto);
        this.notifications.success('Shipping zone saved');
      }
      await this.router.navigateByUrl('/shipping');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
