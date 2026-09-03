import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { ContentType } from '@ecom/types';
import { ContentService } from '../../../core/services/content.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';

interface ContentForm {
  title: string;
  slug: string;
  type: ContentType;
  body: string;
  imageUrl: string;
  linkUrl: string;
  published: boolean;
}

function emptyForm(): ContentForm {
  return { title: '', slug: '', type: 'page' as ContentType, body: '', imageUrl: '', linkUrl: '', published: true };
}

@Component({
  selector: 'app-content-editor',
  imports: [FormsModule, RouterLink],
  templateUrl: './content-editor.html',
})
export class ContentEditor {
  private readonly contentService = inject(ContentService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  protected readonly isNew = computed(() => !this.id());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected form: ContentForm = emptyForm();

  constructor() {
    effect(() => {
      const id = this.id();
      if (this.storeContext.currentStoreId() && id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const c = await this.contentService.get(id);
      this.form = {
        title: c.title,
        slug: c.slug,
        type: c.type,
        body: c.body ?? '',
        imageUrl: c.imageUrl ?? '',
        linkUrl: c.linkUrl ?? '',
        published: c.published,
      };
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    if (!this.form.title.trim()) {
      this.notifications.error('Title is required');
      return;
    }
    this.saving.set(true);
    try {
      const dto = {
        title: this.form.title,
        slug: this.form.slug || undefined,
        type: this.form.type,
        body: this.form.body || undefined,
        imageUrl: this.form.imageUrl || undefined,
        linkUrl: this.form.linkUrl || undefined,
        published: this.form.published,
      };
      if (this.isNew()) {
        await this.contentService.create(dto);
        this.notifications.success('Content created');
      } else {
        await this.contentService.update(this.id()!, dto);
        this.notifications.success('Content saved');
      }
      await this.router.navigateByUrl('/content');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
