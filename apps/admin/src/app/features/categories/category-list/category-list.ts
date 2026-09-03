import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Category } from '@ecom/types';
import { CategoryService } from '../../../core/services/category.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { ConfirmService } from '../../../shared/confirm-dialog/confirm.service';
import { extractErrorMessage } from '../../../core/http-error';
import { StatusBadge } from '../../../shared/status-badge/status-badge';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { LoadingState } from '../../../shared/loading-state/loading-state';

interface CategoryRow extends Category {
  depth: number;
}

@Component({
  selector: 'app-category-list',
  imports: [RouterLink, StatusBadge, EmptyState, LoadingState],
  templateUrl: './category-list.html',
})
export class CategoryList {
  private readonly categoryService = inject(CategoryService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);

  protected readonly rows = computed<CategoryRow[]>(() => {
    const all = this.categories();
    const byParent = new Map<string, Category[]>();
    for (const c of all) {
      const key = c.parentId ?? 'root';
      byParent.set(key, [...(byParent.get(key) ?? []), c]);
    }
    const result: CategoryRow[] = [];
    const walk = (parentKey: string, depth: number) => {
      for (const c of byParent.get(parentKey) ?? []) {
        result.push({ ...c, depth });
        walk(c._id, depth + 1);
      }
    };
    walk('root', 0);
    return result;
  });

  constructor() {
    effect(() => {
      if (this.storeContext.currentStoreId()) void this.load();
      else this.loading.set(false);
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.categories.set(await this.categoryService.tree());
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async remove(category: Category): Promise<void> {
    const ok = await this.confirm.confirm({
      title: `Delete "${category.name}"?`,
      message: 'Child categories will be moved to the root level.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      await this.categoryService.remove(category._id);
      this.notifications.success('Category deleted');
      await this.load();
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    }
  }
}
