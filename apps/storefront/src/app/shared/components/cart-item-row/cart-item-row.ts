import { Component, input, output } from '@angular/core';
import type { CartItem } from '@ecom/types';
import { ProductPrice } from '../product-price/product-price';
import { QuantityStepper } from '../quantity-stepper/quantity-stepper';

@Component({
  selector: 'app-cart-item-row',
  imports: [ProductPrice, QuantityStepper],
  template: `
    <div class="flex gap-4 py-4">
      <div class="h-20 w-16 shrink-0 overflow-hidden bg-(--color-store-light)">
        @if (item().image) {
          <img [src]="item().image" [alt]="item().name" class="h-full w-full object-cover" />
        }
      </div>
      <div class="flex flex-1 flex-col justify-between">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-sm font-medium">{{ item().name }}</p>
            @if (item().sku) {
              <p class="mt-0.5 text-xs text-(--color-store-text-faint)">SKU {{ item().sku }}</p>
            }
          </div>
          <button
            type="button"
            class="text-(--color-store-text-faint) hover:text-(--color-store-primary)"
            (click)="remove.emit()"
            [disabled]="busy()"
            aria-label="Remove item"
          >
            &times;
          </button>
        </div>
        <div class="flex items-center justify-between">
          <app-quantity-stepper [value]="item().quantity" [disabled]="busy()" (changed)="quantityChanged.emit($event)" />
          <app-product-price [price]="item().price * item().quantity" [currency]="currency()" />
        </div>
      </div>
    </div>
  `,
})
export class CartItemRow {
  readonly item = input.required<CartItem & { _id?: string }>();
  readonly currency = input('EUR');
  readonly busy = input(false);
  readonly quantityChanged = output<number>();
  readonly remove = output<void>();
}
