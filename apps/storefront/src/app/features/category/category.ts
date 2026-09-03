import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import type { Product } from '@ecom/types';
import { ProductService } from '../../core/api/product.service';
import { CategoryService, type CategoryNode } from '../../core/api/category.service';
import { CollectionService } from '../../core/api/collection.service';
import { BrandService } from '../../core/api/brand.service';
import { ProductGrid } from '../../shared/components/product-grid/product-grid';
import { ProductGridSkeleton } from '../../shared/components/loading-skeleton/loading-skeleton';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { ErrorState } from '../../shared/components/error-state/error-state';
import { Breadcrumb, type BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb';
import { Pagination } from '../../shared/components/pagination/pagination';
import { FilterPanel } from './filter-panel/filter-panel';
import { SortDropdown } from './sort-dropdown/sort-dropdown';
import type { FacetOption, ListingMode, SiblingLink, SortKey } from '../../models/listing.model';

const PAGE_SIZE = 9;
const FETCH_LIMIT = 200;

@Component({
  selector: 'app-category-page',
  imports: [
    ProductGrid,
    ProductGridSkeleton,
    EmptyState,
    ErrorState,
    Breadcrumb,
    Pagination,
    FilterPanel,
    SortDropdown,
  ],
  templateUrl: './category.html',
})
export class CategoryPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly collectionService = inject(CollectionService);
  private readonly brandService = inject(BrandService);

  readonly slug = input.required<string>();
  readonly mode = input<ListingMode>('category');

  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly siblings = signal<SiblingLink[]>([]);
  protected readonly breadcrumbs = signal<BreadcrumbItem[]>([{ label: 'Kezdőlap', url: '/' }]);

  protected readonly allProducts = signal<Product[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly mobileFiltersOpen = signal(false);

  private readonly queryParamMap = toSignal(this.route.queryParamMap);

  protected readonly filters = computed(() => {
    const params = this.queryParamMap();
    return {
      sizes: params?.getAll('size') ?? [],
      colors: params?.getAll('color') ?? [],
      maxPrice: params?.has('maxPrice') ? Number(params.get('maxPrice')) : null,
      sort: (params?.get('sort') as SortKey) || 'featured',
      page: params?.has('page') ? Math.max(1, Number(params.get('page'))) : 1,
    };
  });

  protected readonly priceCeiling = computed(() =>
    Math.ceil(this.allProducts().reduce((max, p) => Math.max(max, p.basePrice), 0)),
  );

  protected readonly sizeFacets = computed<FacetOption[]>(() => this.facetsFor('size'));
  protected readonly colorFacets = computed<FacetOption[]>(() => this.facetsFor('color'));

  protected readonly filteredProducts = computed(() => {
    const { sizes, colors, maxPrice, sort } = this.filters();
    let list = this.allProducts();

    if (sizes.length) {
      list = list.filter((p) => (p.variants ?? []).some((v) => v.attributes.some((a) => a.attributeSlug === 'size' && sizes.includes(a.value))));
    }
    if (colors.length) {
      list = list.filter((p) => (p.variants ?? []).some((v) => v.attributes.some((a) => a.attributeSlug === 'color' && colors.includes(a.value))));
    }
    if (maxPrice != null && maxPrice < this.priceCeiling()) {
      list = list.filter((p) => p.basePrice <= maxPrice);
    }

    list = [...list];
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-desc':
        list.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return list;
  });

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / PAGE_SIZE)));

  protected readonly pageProducts = computed(() => {
    const page = Math.min(this.filters().page, this.totalPages());
    return this.filteredProducts().slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  });

  constructor() {
    effect(() => {
      const slug = this.slug();
      const mode = this.mode();
      void this.load(slug, mode);
    });
  }

  protected async load(slug: string, mode: ListingMode): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    try {
      let resourceId: string | undefined;

      if (mode === 'collection') {
        const collection = await this.collectionService.findBySlug(slug);
        if (!collection) throw new Error('Collection not found');
        this.title.set(collection.name);
        this.description.set(collection.description ?? '');
        resourceId = collection._id;
        this.siblings.set([]);
        this.breadcrumbs.set([{ label: 'Kezdőlap', url: '/' }, { label: collection.name }]);
        this.allProducts.set((await this.productService.list({ collectionId: resourceId, limit: FETCH_LIMIT })).data);
      } else if (mode === 'brand') {
        const allBrands = await this.brandService.list();
        const brand = allBrands.find((b) => b.slug === slug);
        if (!brand) throw new Error('Brand not found');
        this.title.set(brand.name);
        this.description.set(brand.description ?? '');
        resourceId = brand._id;
        this.siblings.set([]);
        this.breadcrumbs.set([{ label: 'Kezdőlap', url: '/' }, { label: 'Márkák', url: '/brands' }, { label: brand.name }]);
        this.allProducts.set((await this.productService.list({ brandId: resourceId, limit: FETCH_LIMIT })).data);
      } else {
        const tree = await this.categoryService.tree();
        const category = tree.flatMap((c) => [c, ...c.children]).find((c) => c.slug === slug);
        if (!category) throw new Error('Category not found');
        this.title.set(category.name);
        this.description.set(category.description ?? '');
        resourceId = category._id;

        const parent = category.parentId ? tree.find((c) => c._id === category.parentId) : undefined;
        const siblingNodes: CategoryNode[] = parent ? parent.children : tree;
        this.siblings.set(
          siblingNodes.map((s) => ({ slug: s.slug, name: s.name, count: 0, active: s.slug === slug })),
        );

        const crumbs: BreadcrumbItem[] = [{ label: 'Kezdőlap', url: '/' }];
        if (parent) crumbs.push({ label: parent.name });
        crumbs.push({ label: category.name });
        this.breadcrumbs.set(crumbs);

        this.allProducts.set((await this.productService.list({ categoryId: resourceId, limit: FETCH_LIMIT })).data);
      }
    } catch {
      this.error.set(true);
      this.allProducts.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  protected retry(): void {
    void this.load(this.slug(), this.mode());
  }

  protected toggleSize(value: string): void {
    const current = this.filters().sizes;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.updateQuery({ size: next.length ? next : null, page: null });
  }

  protected toggleColor(value: string): void {
    const current = this.filters().colors;
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.updateQuery({ color: next.length ? next : null, page: null });
  }

  protected setMaxPrice(value: number): void {
    this.updateQuery({ maxPrice: value >= this.priceCeiling() ? null : value, page: null });
  }

  protected setSort(sort: SortKey): void {
    this.updateQuery({ sort: sort === 'featured' ? null : sort });
  }

  protected setPage(page: number): void {
    this.updateQuery({ page: page > 1 ? page : null });
  }

  protected clearFilters(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  private updateQuery(patch: Record<string, string | number | string[] | null>): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: patch, queryParamsHandling: 'merge' });
  }

  private facetsFor(attributeSlug: 'size' | 'color'): FacetOption[] {
    const counts = new Map<string, number>();
    for (const product of this.allProducts()) {
      const values = new Set(
        (product.variants ?? [])
          .flatMap((v) => v.attributes)
          .filter((a) => a.attributeSlug === attributeSlug)
          .map((a) => a.value),
      );
      for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({ value, label: value.toUpperCase(), count }));
  }
}
