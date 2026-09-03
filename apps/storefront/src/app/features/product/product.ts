import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { Product } from '@ecom/types';
import { ProductService } from '../../core/api/product.service';
import { CategoryService } from '../../core/api/category.service';
import { CartService } from '../../core/api/cart.service';
import { WishlistService } from '../../core/wishlist.service';
import { ToastService } from '../../core/toast.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { Breadcrumb, type BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb';
import { ProductPrice } from '../../shared/components/product-price/product-price';
import { ProductGrid } from '../../shared/components/product-grid/product-grid';
import { SectionHeading } from '../../shared/components/section-heading/section-heading';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { QuantityStepper } from '../../shared/components/quantity-stepper/quantity-stepper';
import { ProductGallery } from './product-gallery/product-gallery';
import { VariantSelector } from './variant-selector/variant-selector';
import { ProductTabs } from './product-tabs/product-tabs';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

const NEW_WINDOW_DAYS = 21;

@Component({
  selector: 'app-product-page',
  imports: [
    Breadcrumb,
    ProductPrice,
    ProductGrid,
    SectionHeading,
    ErrorState,
    QuantityStepper,
    ProductGallery,
    VariantSelector,
    ProductTabs,
    TranslatePipe,
  ],
  templateUrl: './product.html',
})
export class ProductPage {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  readonly slug = input.required<string>();

  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly related = signal<Product[]>([]);
  protected readonly breadcrumbs = signal<BreadcrumbItem[]>([{ label: 'Kezdőlap', url: '/' }]);

  protected readonly selectedColor = signal<string | null>(null);
  protected readonly selectedSize = signal<string | null>(null);
  protected readonly quantity = signal(1);
  protected readonly adding = signal(false);

  protected readonly variants = computed(() => this.product()?.variants ?? []);

  protected readonly selectedVariant = computed(() => {
    const variants = this.variants();
    if (variants.length === 0) return null;
    const color = this.selectedColor();
    const size = this.selectedSize();
    return (
      variants.find(
        (v) =>
          (!color || v.attributes.some((a) => a.attributeSlug === 'color' && a.value === color)) &&
          (!size || v.attributes.some((a) => a.attributeSlug === 'size' && a.value === size)),
      ) ?? null
    );
  });

  protected readonly images = computed(() => {
    const variant = this.selectedVariant();
    if (variant && variant.images.length > 0) return variant.images;
    return this.product()?.images ?? [];
  });

  protected readonly price = computed(() => this.selectedVariant()?.price ?? this.product()?.basePrice ?? 0);
  protected readonly compareAt = computed(() => this.selectedVariant()?.compareAtPrice ?? this.product()?.compareAtPrice ?? null);
  protected readonly maxQuantity = computed(() => Math.max(1, Math.min(this.selectedVariant()?.stock ?? 10, 10)));

  protected readonly canAddToCart = computed(() => {
    if (this.variants().length === 0) return true;
    const variant = this.selectedVariant();
    return !!variant && variant.stock > 0;
  });

  protected readonly wished = computed(() => (this.product() ? this.wishlist.has(this.product()!._id) : false));

  protected readonly isNew = computed(() => {
    const product = this.product();
    if (!product) return false;
    return Date.now() - new Date(product.createdAt).getTime() < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  });

  constructor() {
    effect(() => {
      const slug = this.slug();
      void this.load(slug);
    });
  }

  private async load(slug: string): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    this.quantity.set(1);
    try {
      const product = await this.productService.getBySlug(slug);
      this.product.set(product);

      const variants = product.variants ?? [];
      const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0];
      this.selectedColor.set(firstAvailable?.attributes.find((a) => a.attributeSlug === 'color')?.value ?? null);
      this.selectedSize.set(firstAvailable?.attributes.find((a) => a.attributeSlug === 'size')?.value ?? null);

      await this.buildBreadcrumbs(product);
      this.related.set(await this.productService.related(product, 4));
    } catch {
      this.error.set(true);
      this.product.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private async buildBreadcrumbs(product: Product): Promise<void> {
    const tree = await this.categoryService.tree();
    const flat = tree.flatMap((top) => [top, ...top.children]);
    const category = flat.find((c) => c._id === product.categoryIds[0]);
    const crumbs: BreadcrumbItem[] = [{ label: 'Kezdőlap', url: '/' }];
    if (category) {
      const parent = category.parentId ? tree.find((c) => c._id === category.parentId) : undefined;
      if (parent) crumbs.push({ label: parent.name });
      crumbs.push({ label: category.name, url: `/category/${category.slug}` });
    }
    crumbs.push({ label: product.name });
    this.breadcrumbs.set(crumbs);
  }

  protected retry(): void {
    void this.load(this.slug());
  }

  protected selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  protected selectSize(size: string): void {
    this.selectedSize.set(size);
  }

  protected async addToCart(buyNow: boolean): Promise<void> {
    const product = this.product();
    if (!product || !this.canAddToCart() || this.adding()) return;

    this.adding.set(true);
    try {
      const variant = this.selectedVariant();
      const variantLabel = [this.selectedColor(), this.selectedSize()]
        .filter((v): v is string => !!v)
        .map((v) => v[0].toUpperCase() + v.slice(1))
        .join(' / ');

      await this.cart.addItem({
        productId: product._id,
        variantId: variant?._id,
        name: variantLabel ? `${product.name} — ${variantLabel}` : product.name,
        sku: variant?.sku,
        quantity: this.quantity(),
        price: this.price(),
        image: this.images()[0]?.url,
      });

      if (buyNow) {
        this.router.navigateByUrl('/checkout');
      } else {
        this.toast.success(this.i18n.t('product.addedToCart'));
        this.cart.openDrawer();
      }
    } finally {
      this.adding.set(false);
    }
  }

  protected toggleWishlist(): void {
    const product = this.product();
    if (product) this.wishlist.toggle(product._id);
  }
}
