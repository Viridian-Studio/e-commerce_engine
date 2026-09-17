import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '@ecom/types';
import { WishlistService } from '../../../core/wishlist.service';
import { CartService } from '../../../core/api/cart.service';
import { ToastService } from '../../../core/toast.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { TemplateService } from '../../../core/theme/template.service';
import { ProductPrice } from '../product-price/product-price';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

const NEW_WINDOW_DAYS = 21;

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, ProductPrice, TranslatePipe],
  template: `
    <article class="group card-tile">
      <a [routerLink]="['/product', product().slug]" class="relative block overflow-hidden bg-(--color-store-light) shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-shadow duration-300 group-hover:shadow-[0_8px_28px_-6px_rgba(0,0,0,0.55)]">
        <div class="card-media w-full overflow-hidden">
          <img
            [src]="primaryImage()"
            [alt]="product().name"
            loading="lazy"
            class="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
          @if (hoverImage(); as hover) {
            <img
              [src]="hover"
              [alt]="product().name"
              loading="lazy"
              class="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          }
        </div>

        <div class="absolute top-2 left-2 flex flex-col gap-1.5">
          @if (isNew()) {
            <span class="badge-new">{{ 'product.new' | t }}</span>
          }
          @if (discountPercent(); as pct) {
            <span class="badge-sale">-{{ pct }}%</span>
          }
        </div>

        <button
          type="button"
          class="absolute top-2 right-2 flex h-8 w-8 items-center justify-center bg-white/90 transition-transform hover:scale-105"
          [class.text-(--color-store-primary)]="wished()"
          [class.text-(--color-store-ink)]="!wished()"
          [attr.aria-pressed]="wished()"
          [attr.aria-label]="'nav.wishlist' | t"
          (click)="onWishlist($event)"
        >
          <svg viewBox="0 0 24 24" [attr.fill]="wished() ? 'currentColor' : 'none'" class="h-4 w-4">
            <path
              stroke="currentColor"
              stroke-width="1.6"
              d="M12 21s-7.5-4.6-10-9.2C.5 8.2 2.4 4.5 6 4.5c2 0 3.5 1 6 3.3 2.5-2.3 4-3.3 6-3.3 3.6 0 5.5 3.7 4 7.3-2.5 4.6-10 9.2-10 9.2Z"
            />
          </svg>
        </button>
      </a>

      <div class="mt-3">
        <a
          [routerLink]="['/product', product().slug]"
          class="text-sm font-medium hover:text-(--color-store-primary)"
          [class.line-clamp-2]="detailed()"
        >
          {{ product().name }}
        </a>

        @if (detailed() && inStock() !== null) {
          <!-- Catalog shoppers decide on availability, so it sits above the
               price rather than behind a click on the product page. -->
          <p class="mt-1.5 flex items-center gap-1.5 text-xs" [class.text-(--color-store-text-faint)]="!inStock()">
            <span class="h-1.5 w-1.5 rounded-full" [style.background]="inStock() ? '#16a34a' : 'currentColor'"></span>
            <span [style.color]="inStock() ? '#16a34a' : null">
              {{ (inStock() ? 'product.inStock' : 'product.outOfStock') | t }}
            </span>
          </p>
        }

        <div class="mt-1">
          <app-product-price [price]="product().basePrice" [compareAt]="product().compareAtPrice" [currency]="product().currency" />
        </div>

        @if (buyable()) {
          <!-- Catalog templates buy from the tile. Products with real choices
               (more than one variant) send the shopper to the product page
               instead of silently picking a size for them. -->
          @if (needsChoice()) {
            <a [routerLink]="['/product', product().slug]" class="btn-outline-ink mt-2.5 w-full text-xs">
              {{ 'product.chooseOptions' | t }}
            </a>
          } @else {
            <button type="button" class="btn-primary mt-2.5 w-full text-xs" [disabled]="adding()" (click)="onAddToCart()">
              {{ (adding() ? 'product.adding' : 'product.addToCart') | t }}
            </button>
          }
        } @else if (!detailed() && colors().length > 1) {
          <div class="mt-2 flex items-center gap-1.5">
            @for (color of colors(); track color) {
              <span
                class="h-3.5 w-3.5 rounded-full border border-white/20"
                [style.background]="swatch(color)"
                [attr.aria-label]="color"
              ></span>
            }
          </div>
        }
      </div>
    </article>
  `,
})
export class ProductCard {
  private readonly wishlist = inject(WishlistService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly templates = inject(TemplateService);

  readonly product = input.required<Product>();

  private readonly variant = computed(() => this.templates.layout().productCard);
  /** Catalog-style tiles buy straight from the grid; editorial ones don't. */
  protected readonly buyable = computed(() => this.variant() !== 'editorial');
  protected readonly detailed = computed(() => this.variant() === 'detailed');
  protected readonly adding = signal(false);

  protected readonly primaryImage = computed(() => this.product().images[0]?.url ?? '');
  protected readonly hoverImage = computed(() => this.product().images[1]?.url);
  protected readonly wished = computed(() => this.wishlist.has(this.product()._id));

  /** More than one variant means the shopper has a real choice to make. */
  protected readonly needsChoice = computed(() => (this.product().variants?.length ?? 0) > 1);

  /**
   * Availability across every variant — `null` when the product carries no
   * variants at all, in which case the tile stays silent instead of claiming
   * a stock level the engine doesn't track.
   */
  protected readonly inStock = computed<boolean | null>(() => {
    const variants = this.product().variants ?? [];
    if (variants.length === 0) return null;
    return variants.some((v) => v.stock > 0);
  });

  protected readonly isNew = computed(() => {
    const created = new Date(this.product().createdAt).getTime();
    return Date.now() - created < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  });

  protected readonly discountPercent = computed(() => {
    const { basePrice, compareAtPrice } = this.product();
    if (!compareAtPrice || compareAtPrice <= basePrice) return null;
    return Math.round(((compareAtPrice - basePrice) / compareAtPrice) * 100);
  });

  protected readonly colors = computed(() => {
    const variants = this.product().variants ?? [];
    const values = variants.flatMap((v) => v.attributes.filter((a) => a.attributeSlug === 'color').map((a) => a.value));
    return [...new Set(values)];
  });

  protected swatch(color: string): string {
    const known: Record<string, string> = {
      black: '#111111',
      white: '#f5f5f5',
      red: '#e2141f',
      grey: '#8a8a8f',
      gray: '#8a8a8f',
      blue: '#2b4bff',
      yellow: '#f5c518',
    };
    return known[color.toLowerCase()] ?? color;
  }

  protected onWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlist.toggle(this.product()._id);
  }

  protected async onAddToCart(): Promise<void> {
    if (this.adding()) return;
    const product = this.product();
    const variant = product.variants?.[0];
    this.adding.set(true);
    try {
      await this.cart.addItem({
        productId: product._id,
        variantId: variant?._id,
        name: product.name,
        sku: variant?.sku,
        quantity: 1,
        price: variant?.price ?? product.basePrice,
        currency: product.currency,
        image: this.primaryImage() || undefined,
      });
      this.toast.success(this.i18n.t('product.addedToCart'));
      this.cart.openDrawer();
    } finally {
      this.adding.set(false);
    }
  }
}
