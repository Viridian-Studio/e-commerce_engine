import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '@ecom/types';
import { ProductService } from '../../core/api/product.service';
import { WishlistService } from '../../core/wishlist.service';
import { ProductGrid } from '../../shared/components/product-grid/product-grid';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-wishlist-page',
  imports: [RouterLink, ProductGrid, EmptyState, TranslatePipe],
  templateUrl: './wishlist.html',
})
export class WishlistPage {
  private readonly productService = inject(ProductService);
  private readonly wishlist = inject(WishlistService);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly count = this.wishlist.count;

  protected readonly hasItems = computed(() => this.products().length > 0);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const ids = this.wishlist.ids();
    if (ids.size === 0) {
      this.products.set([]);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    try {
      const res = await this.productService.list({
        ids: [...ids].join(','),
        limit: 60,
      });
      this.products.set(res.data);
    } catch {
      this.products.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected refresh(): void {
    void this.load();
  }
}
