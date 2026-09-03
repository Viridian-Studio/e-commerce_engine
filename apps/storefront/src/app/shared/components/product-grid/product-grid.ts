import { Component, input } from '@angular/core';
import type { Product } from '@ecom/types';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-grid',
  imports: [ProductCard],
  template: `
    <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      @for (product of products(); track product._id) {
        <app-product-card [product]="product" />
      }
    </div>
  `,
})
export class ProductGrid {
  readonly products = input.required<Product[]>();
}
