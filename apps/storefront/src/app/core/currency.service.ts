import { Injectable, computed, signal } from '@angular/core';

export type DisplayCurrency = 'HUF' | 'EUR' | 'USD';

const CURRENCY_KEY = 'ecom_storefront_display_currency';
const SUPPORTED: DisplayCurrency[] = ['HUF', 'EUR', 'USD'];

/**
 * Approximate, display-only conversion rates (base: EUR). These are NOT
 * live/authoritative — the engine only ever prices in the store's own
 * currency (EUR for this store), and checkout always charges that amount.
 * This service exists purely so shoppers can see a rough estimate in a
 * currency they think in; it never feeds a number back into any commerce
 * calculation. Swap `RATES_FROM_EUR` for a live FX endpoint later without
 * touching any component — they all go through `format()`.
 */
const RATES_FROM_EUR: Record<DisplayCurrency, number> = {
  EUR: 1,
  HUF: 395,
  USD: 1.08,
};

function readCurrency(): DisplayCurrency {
  try {
    const stored = localStorage.getItem(CURRENCY_KEY);
    if (stored && SUPPORTED.includes(stored as DisplayCurrency)) return stored as DisplayCurrency;
  } catch {
    /* storage unavailable */
  }
  return 'EUR';
}

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  readonly supported = SUPPORTED;
  readonly selected = signal<DisplayCurrency>(readCurrency());

  readonly isEstimate = computed(() => this.selected() !== 'EUR');

  setCurrency(currency: DisplayCurrency): void {
    this.selected.set(currency);
    try {
      localStorage.setItem(CURRENCY_KEY, currency);
    } catch {
      /* storage unavailable */
    }
  }

  /** Converts an amount already in `storeCurrency` into the selected display currency. */
  convert(amount: number, storeCurrency: string): number {
    const from = RATES_FROM_EUR[storeCurrency as DisplayCurrency] ?? 1;
    const to = RATES_FROM_EUR[this.selected()] ?? 1;
    return (amount / from) * to;
  }

  format(amount: number, storeCurrency: string): string {
    const converted = this.convert(amount, storeCurrency);
    return new Intl.NumberFormat('hu-HU', { style: 'currency', currency: this.selected() }).format(converted);
  }
}
