import { Component, inject } from '@angular/core';
import { CurrencyService, type DisplayCurrency } from '../../../core/currency.service';

@Component({
  selector: 'app-currency-switcher',
  template: `
    <select
      class="border-none bg-transparent text-[11px] font-semibold tracking-wide text-(--color-store-text-faint) outline-none hover:text-(--color-store-text-muted)"
      [value]="currency.selected()"
      (change)="onChange($event)"
      aria-label="Pénznem"
    >
      @for (c of currency.supported; track c) {
        <option [value]="c" class="bg-(--color-store-surface) text-(--color-store-text)">{{ c }}</option>
      }
    </select>
  `,
})
export class CurrencySwitcher {
  protected readonly currency = inject(CurrencyService);

  protected onChange(event: Event): void {
    this.currency.setCurrency((event.target as HTMLSelectElement).value as DisplayCurrency);
  }
}
