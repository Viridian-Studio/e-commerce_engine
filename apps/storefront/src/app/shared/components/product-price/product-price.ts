import { Component, inject, input } from '@angular/core';
import { CurrencyService } from '../../../core/currency.service';

@Component({
  selector: 'app-product-price',
  template: `
    <span class="flex items-baseline gap-2" [class.text-lg]="size() === 'lg'" [class.font-bold]="size() === 'lg'">
      <span [class]="onLight() ? 'text-(--color-store-ink)' : 'text-(--color-store-text)'">{{
        formatted(price())
      }}</span>
      @if (compareAt() && compareAt()! > price()) {
        <span class="text-sm text-(--color-store-text-faint) line-through" [class.text-black_40]="onLight()">
          {{ formatted(compareAt()!) }}
        </span>
      }
    </span>
  `,
})
export class ProductPrice {
  private readonly currencyService = inject(CurrencyService);

  readonly price = input.required<number>();
  readonly compareAt = input<number | null | undefined>();
  /** Currency the `price`/`compareAt` values are already denominated in (the store's own currency). */
  readonly currency = input('EUR');
  readonly size = input<'sm' | 'lg'>('sm');
  readonly onLight = input(false);

  protected formatted(value: number): string {
    return this.currencyService.format(value, this.currency());
  }
}
