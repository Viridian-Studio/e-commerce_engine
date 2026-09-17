import { Component, inject, signal } from '@angular/core';
import { ProductService } from '../../../../core/api/product.service';
import { TemplateService } from '../../../../core/theme/template.service';
import { CollectionService } from '../../../../core/api/collection.service';
import { ProductGrid } from '../../../../shared/components/product-grid/product-grid';
import { ProductGridSkeleton } from '../../../../shared/components/loading-skeleton/loading-skeleton';
import { SectionHeading } from '../../../../shared/components/section-heading/section-heading';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';
import type { Product } from '@ecom/types';

const FEATURED_COLLECTION_SLUG = 'best-sellers';

@Component({
  selector: 'app-featured-products',
  imports: [ProductGrid, ProductGridSkeleton, SectionHeading, TranslatePipe],
  template: `
    <section class="section-dark section-pad">
      <div class="container-store">
        <app-section-heading [title]="'home.featured' | t" [linkUrl]="viewAllUrl()" />
        @if (loading()) {
          <app-product-grid-skeleton [count]="count" />
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
  private readonly templates = inject(TemplateService);

  /** One full grid row — five tiles on an editorial grid, ten on a dense one. */
  protected readonly count = this.templates.layout().featuredCount;

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
        ? await this.productService.list({ collectionId: collection._id, limit: this.count })
        : await this.productService.list({ limit: this.count, sort: 'createdAt', order: 'desc' });
      this.products.set(data);
    } finally {
      this.loading.set(false);
    }
  }
}
