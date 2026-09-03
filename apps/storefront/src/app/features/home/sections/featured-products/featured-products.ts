import { Component, inject, signal } from '@angular/core';
import { ProductService } from '../../../../core/api/product.service';
import { CollectionService } from '../../../../core/api/collection.service';
import { ProductGrid } from '../../../../shared/components/product-grid/product-grid';
import { ProductGridSkeleton } from '../../../../shared/components/loading-skeleton/loading-skeleton';
import { SectionHeading } from '../../../../shared/components/section-heading/section-heading';
import type { Product } from '@ecom/types';

const FEATURED_COLLECTION_SLUG = 'best-sellers';

@Component({
  selector: 'app-featured-products',
  imports: [ProductGrid, ProductGridSkeleton, SectionHeading],
  template: `
    <section class="section-dark py-14 sm:py-20">
      <div class="container-store">
        <app-section-heading title="Featured Products" [linkUrl]="viewAllUrl()" />
        @if (loading()) {
          <app-product-grid-skeleton [count]="5" />
        } @else if (products().length > 0) {
          <app-product-grid [products]="products()" />
        }
      </div>
    </section>
  `,
})
export class FeaturedProducts {
  private readonly productService = inject(ProductService);
  private readonly collectionService = inject(CollectionService);

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly viewAllUrl = signal<string>('/collection/' + FEATURED_COLLECTION_SLUG);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const collection = await this.collectionService.findBySlug(FEATURED_COLLECTION_SLUG);
      const { data } = collection
        ? await this.productService.list({ collectionId: collection._id, limit: 5 })
        : await this.productService.list({ limit: 5, sort: 'createdAt', order: 'desc' });
      this.products.set(data);
    } finally {
      this.loading.set(false);
    }
  }
}
