import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoryService, type CategoryNode } from '../../../../core/api/category.service';
import { ProductService } from '../../../../core/api/product.service';

interface CategoryCard {
  slug: string;
  name: string;
  image: string;
  count: number;
}

@Component({
  selector: 'app-shop-by-category',
  imports: [RouterLink],
  template: `
    <section class="section-light py-14 sm:py-20">
      <div class="container-store">
        <h2 class="heading-lg mb-8">Shop by Category</h2>
        <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          @for (card of cards(); track card.slug) {
            <a [routerLink]="['/category', card.slug]" class="group relative block aspect-[3/4] overflow-hidden bg-black">
              <img [src]="card.image" [alt]="card.name" loading="lazy" class="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"></div>
              <div class="absolute bottom-0 left-0 p-4 text-white">
                <p class="text-sm font-bold tracking-wide uppercase">{{ card.name }}</p>
                <p class="text-xs text-white/70">{{ card.count }} items</p>
              </div>
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class ShopByCategory {
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);

  protected readonly cards = signal<CategoryCard[]>([]);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    const tree = await this.categoryService.tree();
    const leaves: CategoryNode[] = tree.flatMap((top) => (top.children.length > 0 ? top.children : [top]));
    const picked = leaves.slice(0, 4);

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
