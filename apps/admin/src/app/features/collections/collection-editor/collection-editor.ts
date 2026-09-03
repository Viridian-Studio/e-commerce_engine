import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { ProductStatus } from '@ecom/types';
import { CollectionService } from '../../../core/services/collection.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';

interface CollectionForm {
  name: string;
  slug: string;
  description: string;
  image: string;
  status: ProductStatus;
}

@Component({
  selector: 'app-collection-editor',
  imports: [FormsModule, RouterLink],
  templateUrl: './collection-editor.html',
})
export class CollectionEditor {
  private readonly collectionService = inject(CollectionService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  protected readonly isNew = computed(() => !this.id());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected form: CollectionForm = { name: '', slug: '', description: '', image: '', status: 'active' as ProductStatus };

  constructor() {
    effect(() => {
      const id = this.id();
      if (this.storeContext.currentStoreId() && id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const c = await this.collectionService.get(id);
      this.form = { name: c.name, slug: c.slug, description: c.description ?? '', image: c.image ?? '', status: c.status };
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
        await this.collectionService.create(dto);
        this.notifications.success('Collection created');
      } else {
        await this.collectionService.update(this.id()!, dto);
        this.notifications.success('Collection saved');
      }
      await this.router.navigateByUrl('/collections');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
