import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { DiscountStatus, DiscountType } from '@ecom/types';
import { DiscountService } from '../../../core/services/discount.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';

interface DiscountForm {
  code: string;
  description: string;
  type: DiscountType;
  value: number;
  minSubtotal: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  startsAt: string;
  endsAt: string;
  status: DiscountStatus;
}

function emptyForm(): DiscountForm {
  return {
    code: '',
    description: '',
    type: 'percentage' as DiscountType,
    value: 10,
    minSubtotal: null,
    maxDiscount: null,
    usageLimit: null,
    startsAt: '',
    endsAt: '',
    status: 'active' as DiscountStatus,
  };
}

@Component({
  selector: 'app-discount-editor',
  imports: [FormsModule, RouterLink],
  templateUrl: './discount-editor.html',
})
export class DiscountEditor {
  private readonly discountService = inject(DiscountService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  protected readonly isNew = computed(() => !this.id());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected form: DiscountForm = emptyForm();

  constructor() {
    effect(() => {
      const id = this.id();
      if (this.storeContext.currentStoreId() && id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const d = await this.discountService.get(id);
      this.form = {
        code: d.code,
        description: d.description ?? '',
        type: d.type,
        value: d.value,
        minSubtotal: d.minSubtotal ?? null,
        maxDiscount: d.maxDiscount ?? null,
        usageLimit: d.usageLimit ?? null,
        startsAt: d.startsAt ? new Date(d.startsAt).toISOString().slice(0, 10) : '',
        endsAt: d.endsAt ? new Date(d.endsAt).toISOString().slice(0, 10) : '',
        status: d.status,
      };
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    if (!this.form.code.trim()) {
      this.notifications.error('Code is required');
      return;
    }
    this.saving.set(true);
    try {
      const dto = {
        code: this.form.code,
        description: this.form.description || undefined,
        type: this.form.type,
        value: this.form.value,
        minSubtotal: this.form.minSubtotal,
        maxDiscount: this.form.maxDiscount,
        usageLimit: this.form.usageLimit,
        startsAt: this.form.startsAt || null,
        endsAt: this.form.endsAt || null,
        status: this.form.status,
      };
      if (this.isNew()) {
        await this.discountService.create(dto);
        this.notifications.success('Discount created');
      } else {
        await this.discountService.update(this.id()!, dto);
        this.notifications.success('Discount saved');
      }
      await this.router.navigateByUrl('/discounts');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
