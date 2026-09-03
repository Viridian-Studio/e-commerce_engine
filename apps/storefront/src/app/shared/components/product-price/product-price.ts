import { Component, computed, input } from '@angular/core';

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
  readonly price = input.required<number>();
  readonly compareAt = input<number | null | undefined>();
  readonly currency = input('EUR');
  readonly size = input<'sm' | 'lg'>('sm');
  readonly onLight = input(false);

  protected readonly formatter = computed(
    () => new Intl.NumberFormat('hu-HU', { style: 'currency', currency: this.currency() }),
  );

  protected formatted(value: number): string {
    return this.formatter().format(value);
  }
}
