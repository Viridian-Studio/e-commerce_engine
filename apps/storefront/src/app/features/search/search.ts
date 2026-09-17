import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import type { Product } from '@ecom/types';
import { ProductService } from '../../core/api/product.service';
import { ProductGrid } from '../../shared/components/product-grid/product-grid';
import { ProductGridSkeleton } from '../../shared/components/loading-skeleton/loading-skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { TemplateService } from '../../core/theme/template.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { I18nService } from '../../core/i18n/i18n.service';

/**
 * Search results for the header's search field. The engine already filters
 * products by name on the storefront endpoint, so this page is a thin shell
 * around the same grid every other listing uses.
 */
@Component({
  selector: 'app-search-page',
  imports: [ProductGrid, ProductGridSkeleton, EmptyState, ErrorState, TranslatePipe],
  template: `
    <section class="section-dark section-pad">
      <div class="container-store">
        <h1 class="heading-lg">{{ 'search.title' | t }}</h1>
        @if (query()) {
          <p class="mt-2 text-sm text-(--color-store-text-muted)">
            &ldquo;{{ query() }}&rdquo; &middot; {{ products().length }} {{ 'category.items' | t }}
          </p>
        }

        <div class="mt-6">
          @if (loading()) {
            <app-product-grid-skeleton [count]="pageSize" />
          } @else if (error()) {
            <app-error-state />
          } @else if (products().length === 0) {
            <app-empty-state [title]="'search.empty' | t" [message]="'search.emptyMessage' | t" />
          } @else {
            <app-product-grid [products]="products()" />
          }
        </div>
      </div>
    </section>
  `,
})
export class SearchPage {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly templates = inject(TemplateService);
  private readonly i18n = inject(I18nService);

  private readonly queryParamMap = toSignal(this.route.queryParamMap);
  protected readonly query = computed(() => this.queryParamMap()?.get('q')?.trim() ?? '');
  protected readonly pageSize = this.templates.layout().pageSize;

  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal(false);

  constructor() {
    effect(() => {
      const q = this.query();
      // Keep the language in the dependency set so switching locales re-runs
      // the search the same way the rest of the storefront re-renders.
      this.i18n.lang();
      void this.search(q);
    });
  }

  private async search(q: string): Promise<void> {
    if (!q) {
      this.products.set([]);
      return;
    }
    this.loading.set(true);
    this.error.set(false);
    try {
      const { data } = await this.productService.list({ search: q, limit: this.pageSize });
      this.products.set(data);
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
