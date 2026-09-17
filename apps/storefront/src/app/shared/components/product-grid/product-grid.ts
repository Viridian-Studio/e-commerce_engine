import { Component, input } from '@angular/core';
import type { Product } from '@ecom/types';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-grid',
  imports: [ProductCard],
  template: `
    <div class="grid-products">
      @for (product of products(); track product._id) {
        <app-product-card [product]="product" />
      }
    </div>
  `,
})
export class ProductGrid {
  readonly products = input.required<Product[]>();
}
