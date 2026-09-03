import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-quantity-stepper',
  template: `
    <div class="inline-flex items-center border border-(--color-store-border)">
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center text-(--color-store-text) hover:text-(--color-store-primary) disabled:opacity-30"
        [disabled]="disabled() || value() <= min()"
        (click)="changed.emit(value() - 1)"
        aria-label="Mennyiség csökkentése"
      >
        &minus;
      </button>
      <span class="w-8 text-center text-sm">{{ value() }}</span>
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center text-(--color-store-text) hover:text-(--color-store-primary) disabled:opacity-30"
        [disabled]="disabled() || value() >= max()"
        (click)="changed.emit(value() + 1)"
        aria-label="Mennyiség növelése"
      >
        +
      </button>
    </div>
  `,
})
export class QuantityStepper {
  readonly value = input.required<number>();
  readonly min = input(1);
  readonly max = input(99);
  readonly disabled = input(false);
  readonly changed = output<number>();
}
