import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-price-input',
  imports: [FormsModule],
  template: `
    <div class="relative">
      <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-(--color-text-faint)">{{
        currency()
      }}</span>
      <input
        type="number"
        step="0.01"
        min="0"
        class="input pl-12"
        [ngModel]="value()"
        (ngModelChange)="valueChange.emit($event === '' ? null : +$event)"
      />
    </div>
  `,
})
export class PriceInput {
  readonly value = input<number | null>(null);
  readonly currency = input('USD');
  readonly valueChange = output<number | null>();
}
