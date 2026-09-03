import { Component, computed, input } from '@angular/core';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_BY_STATUS: Record<string, Tone> = {
  active: 'success',
  paid: 'success',
  delivered: 'success',
  fulfilled: 'success',
  completed: 'success',
  approved: 'success',

  pending: 'warning',
  processing: 'warning',
  partial: 'warning',
  scheduled: 'warning',
  requested: 'warning',
  low_stock: 'warning',

  confirmed: 'info',
  shipped: 'info',

  cancelled: 'danger',
  failed: 'danger',
  expired: 'danger',
  disabled: 'danger',
  rejected: 'danger',
  refunded: 'danger',
  partially_refunded: 'danger',
  out_of_stock: 'danger',

  draft: 'neutral',
  archived: 'neutral',
  unfulfilled: 'neutral',
};

const TONE_CLASSES: Record<Tone, string> = {
  success: 'bg-(--color-success-soft) text-(--color-success)',
  warning: 'bg-(--color-warning-soft) text-(--color-warning)',
  danger: 'bg-(--color-danger-soft) text-(--color-danger)',
  info: 'bg-(--color-info-soft) text-(--color-info)',
  neutral: 'bg-(--color-surface-3) text-(--color-text-muted)',
};

@Component({
  selector: 'app-status-badge',
  template: `
    <span
      class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize"
      [class]="toneClass()"
    >
      <span class="h-1.5 w-1.5 rounded-full bg-current"></span>
      {{ label() }}
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<string>();

  protected readonly label = computed(() => this.status().replace(/_/g, ' '));
  protected readonly toneClass = computed(
    () => TONE_CLASSES[TONE_BY_STATUS[this.status()] ?? 'neutral'],
  );
}
