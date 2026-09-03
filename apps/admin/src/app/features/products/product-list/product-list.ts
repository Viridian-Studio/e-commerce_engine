import { Component, computed, effect, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Category, Product, ProductStatus } from '@ecom/types';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { extractErrorMessage } from '../../../core/http-error';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { LoadingState } from '../../../shared/loading-state/loading-state';
import { Pagination } from '../../../shared/pagination/pagination';
import { SearchInput } from '../../../shared/search-input/search-input';
import { Select } from '../../../shared/select/select';

@Component({
  selector: 'app-product-list',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    StatusBadge,
    EmptyState,
    LoadingState,
    Pagination,
    SearchInput,
    Select,
  ],
  templateUrl: './product-list.html',
})
export class ProductList {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  protected readonly products = signal<Product[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly page = signal(1);
  protected readonly loading = signal(true);
  protected readonly search = signal('');
  protected readonly status = signal('');
  protected readonly sortField = signal('createdAt');
  protected readonly sortOrder = signal<'asc' | 'desc'>('desc');
  protected readonly selected = signal<Set<string>>(new Set());
  protected readonly bulkStatus = signal('');

  protected readonly statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
  ];

  protected readonly categoryMap = computed(() => new Map(this.categories().map((c) => [c._id, c.name])));
  protected readonly allSelected = computed(
    () => this.products().length > 0 && this.selected().size === this.products().length,
  );

  constructor() {
    effect(() => {
      const storeId = this.storeContext.currentStoreId();
      // Track filters so the effect re-runs when any of them change.
      this.search();
      this.status();
      this.sortField();
      this.sortOrder();
      this.page();
      if (storeId) void this.load();
      else this.loading.set(false);
    });

    effect(() => {
      if (this.storeContext.currentStoreId()) void this.loadCategories();
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      const res = await this.productService.list({
        page: this.page(),
        search: this.search(),
        status: this.status(),
        sort: this.sortField(),
        order: this.sortOrder(),
      });
      this.products.set(res.data);
      this.total.set(res.meta.total);
      this.totalPages.set(res.meta.totalPages);
      this.selected.set(new Set());
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  private async loadCategories(): Promise<void> {
    this.categories.set(await this.categoryService.tree());
  }

  protected onSearch(value: string): void {
    this.page.set(1);
    this.search.set(value);
  }

  protected onStatusFilter(value: string): void {
    this.page.set(1);
    this.status.set(value);
  }

  protected toggleSort(field: string): void {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortOrder.set('asc');
    }
  }

  protected toggleSelectAll(): void {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.products().map((p) => p._id)));
  }

  protected toggleSelect(id: string): void {
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected.set(next);
  }

  protected categoryNames(product: Product): string {
    return product.categoryIds.map((id) => this.categoryMap().get(id)).filter(Boolean).join(', ') || '—';
  }

  protected variantSummary(product: Product): string {
    const count = product.variants?.length ?? 0;
    if (count === 0) return '—';
    return `${count} variant${count === 1 ? '' : 's'}`;
  }

  protected totalStock(product: Product): number {
    return (product.variants ?? []).reduce((sum, v) => sum + v.stock, 0);
  }

  protected async applyBulkStatus(): Promise<void> {
    const status = this.bulkStatus();
    if (!status || this.selected().size === 0) return;
    try {
      await this.productService.bulkStatus(Array.from(this.selected()), status as ProductStatus);
      this.notifications.success(`Updated ${this.selected().size} product(s)`);
      this.bulkStatus.set('');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }

  protected async deleteProduct(product: Product): Promise<void> {
    const ok = await this.confirm.confirm({
      title: `Delete "${product.name}"?`,
      message: 'This will also delete all of its variants. This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await this.productService.remove(product._id);
      this.notifications.success('Product deleted');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }
}
