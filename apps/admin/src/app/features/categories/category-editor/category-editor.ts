import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { Category, CategoryStatus } from '@ecom/types';
import { CategoryService } from '../../../core/services/category.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';

interface CategoryForm {
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId: string;
  status: CategoryStatus;
  seo: { metaTitle: string; metaDescription: string };
}

function emptyForm(): CategoryForm {
  return {
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: '',
    status: 'active' as CategoryStatus,
    seo: { metaTitle: '', metaDescription: '' },
  };
}

@Component({
  selector: 'app-category-editor',
  imports: [FormsModule, RouterLink],
  templateUrl: './category-editor.html',
})
export class CategoryEditor {
  private readonly categoryService = inject(CategoryService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  protected readonly isNew = computed(() => !this.id());

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected form: CategoryForm = emptyForm();

  protected readonly parentOptions = computed(() =>
    this.categories().filter((c) => c._id !== this.id()),
  );

  constructor() {
    effect(() => {
      if (!this.storeContext.currentStoreId()) return;
      void this.categoryService.tree().then((list) => this.categories.set(list));
      const id = this.id();
      if (id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const c = await this.categoryService.get(id);
      this.form = {
        name: c.name,
        slug: c.slug,
        description: c.description ?? '',
        image: c.image ?? '',
        parentId: c.parentId ?? '',
        status: c.status,
        seo: { metaTitle: c.seo?.metaTitle ?? '', metaDescription: c.seo?.metaDescription ?? '' },
      };
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    if (!this.form.name.trim()) {
      this.notifications.error('Name is required');
      return;
    }
    this.saving.set(true);
    try {
      const dto = {
        name: this.form.name,
        slug: this.form.slug || undefined,
        description: this.form.description || undefined,
        image: this.form.image || undefined,
        parentId: this.form.parentId || null,
        status: this.form.status,
        seo: {
          metaTitle: this.form.seo.metaTitle || undefined,
          metaDescription: this.form.seo.metaDescription || undefined,
        },
      };
      if (this.isNew()) {
        await this.categoryService.create(dto);
        this.notifications.success('Category created');
      } else {
        await this.categoryService.update(this.id()!, dto);
        this.notifications.success('Category saved');
      }
      await this.router.navigateByUrl('/categories');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
