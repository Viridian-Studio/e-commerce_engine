import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-product-grid-skeleton',
  template: `
    <div class="grid-products">
      @for (i of items(); track i) {
        <div class="animate-pulse">
          <div class="card-media bg-(--color-store-surface-2)"></div>
          <div class="mt-3 h-3 w-3/4 bg-(--color-store-surface-2)"></div>
          <div class="mt-2 h-3 w-1/3 bg-(--color-store-surface-2)"></div>
        </div>
      }
    </div>
  `,
})
export class ProductGridSkeleton {
  readonly count = input(8);
  protected readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
