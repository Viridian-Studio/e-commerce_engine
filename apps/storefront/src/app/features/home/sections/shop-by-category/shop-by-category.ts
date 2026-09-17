import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService, type CategoryNode } from '../../../../core/api/category.service';
import { ProductService } from '../../../../core/api/product.service';
import { TemplateService } from '../../../../core/theme/template.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

interface CategoryCard {
  slug: string;
  name: string;
  image: string;
  count: number;
}

/**
 * Category entry points. Editorial templates get four tall lifestyle cards;
 * catalog ones get a row of round chips — more categories, less room each,
 * which is what a shopper scanning a large assortment actually wants.
 */
@Component({
  selector: 'app-shop-by-category',
  imports: [RouterLink, TranslatePipe],
  template: `
    @if (circles()) {
      <section class="section-dark section-pad">
        <div class="container-store">
          <h2 class="heading-lg mb-5">{{ 'home.shopByCategory' | t }}</h2>
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
            @for (card of cards(); track card.slug) {
              <a [routerLink]="['/category', card.slug]" class="group flex flex-col items-center gap-2 text-center">
                <span class="block h-20 w-20 overflow-hidden rounded-full border border-(--color-store-border) bg-(--color-store-surface) sm:h-24 sm:w-24">
                  <img
                    [src]="card.image"
                    [alt]="card.name"
                    loading="lazy"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </span>
                <span class="text-xs font-medium group-hover:text-(--color-store-primary)">{{ card.name }}</span>
              </a>
            }
          </div>
        </div>
      </section>
    } @else {
      <section class="section-light section-pad">
        <div class="container-store">
          <h2 class="heading-lg mb-8">{{ 'home.shopByCategory' | t }}</h2>
          <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            @for (card of cards(); track card.slug) {
              <a [routerLink]="['/category', card.slug]" class="group relative block aspect-[3/4] overflow-hidden bg-black">
                <img [src]="card.image" [alt]="card.name" loading="lazy" class="photo-tone h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"></div>
                <div class="absolute bottom-0 left-0 p-4 text-white">
                  <p class="text-sm font-bold tracking-wide uppercase">{{ card.name }}</p>
                  <p class="text-xs text-white/70">{{ card.count }} {{ 'category.items' | t }}</p>
                </div>
              </a>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class ShopByCategory {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly templates = inject(TemplateService);

  protected readonly circles = computed(() => this.templates.layout().categoryCards === 'circle');
  protected readonly cards = signal<CategoryCard[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const tree = await this.categoryService.tree();
    const leaves: CategoryNode[] = tree.flatMap((top) => (top.children.length > 0 ? top.children : [top]));
    // Round chips are small enough to carry two full rows; the photo cards
    // take a single row of four.
    const picked = leaves.slice(0, this.circles() ? 8 : 4);

    const cards = await Promise.all(
      picked.map(async (c) => {
        const { meta } = await this.productService.list({ categoryId: c._id, limit: 1 });
        return {
          slug: c.slug,
          name: c.name,
          image: c.image || `https://picsum.photos/seed/category-${c.slug}/600/800`,
          count: meta.total,
        };
      }),
    );
    this.cards.set(cards);
  }
}
