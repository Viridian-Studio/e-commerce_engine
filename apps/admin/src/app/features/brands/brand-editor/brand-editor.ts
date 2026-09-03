import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { ProductStatus } from '@ecom/types';
import { BrandService } from '../../../core/services/brand.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';

interface BrandForm {
  name: string;
  slug: string;
  description: string;
  image: string;
  status: ProductStatus;
}

@Component({
  selector: 'app-brand-editor',
  imports: [FormsModule, RouterLink],
  templateUrl: './brand-editor.html',
})
export class BrandEditor {
  private readonly brandService = inject(BrandService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  protected readonly isNew = computed(() => !this.id());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected form: BrandForm = { name: '', slug: '', description: '', image: '', status: 'active' as ProductStatus };

  constructor() {
    effect(() => {
      const id = this.id();
      if (this.storeContext.currentStoreId() && id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const b = await this.brandService.get(id);
      this.form = { name: b.name, slug: b.slug, description: b.description ?? '', image: b.image ?? '', status: b.status };
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
        status: this.form.status,
      };
      if (this.isNew()) {
        await this.brandService.create(dto);
        this.notifications.success('Brand created');
      } else {
        await this.brandService.update(this.id()!, dto);
        this.notifications.success('Brand saved');
      }
      await this.router.navigateByUrl('/brands');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
