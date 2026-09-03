import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import type { StoreStatus } from '@ecom/types';
import { StoreService } from '../../../core/services/store.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';

interface StoreForm {
  name: string;
  slug: string;
  domain: string;
  currency: string;
  locale: string;
  timezone: string;
  status: StoreStatus;
  contactEmail: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
}

function emptyForm(): StoreForm {
  return {
    name: '',
    slug: '',
    domain: '',
    currency: 'USD',
    locale: 'en-US',
    timezone: 'UTC',
    status: 'active' as StoreStatus,
    contactEmail: '',
    primaryColor: '#6366f1',
    accentColor: '#111111',
    logoUrl: '',
  };
}

@Component({
  selector: 'app-store-editor',
  imports: [FormsModule, RouterLink],
  templateUrl: './store-editor.html',
})
export class StoreEditor {
  private readonly storeService = inject(StoreService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly id = input<string>();
  protected readonly isNew = computed(() => !this.id());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected form: StoreForm = emptyForm();

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const s = await this.storeService.get(id);
      this.form = {
        name: s.name,
        slug: s.slug,
        domain: s.domain ?? '',
        currency: s.currency,
        locale: s.locale,
        timezone: s.timezone,
        status: s.status,
        contactEmail: s.contactEmail ?? '',
        primaryColor: s.theme.primaryColor ?? '#6366f1',
        accentColor: s.theme.accentColor ?? '#111111',
        logoUrl: s.theme.logoUrl ?? '',
      };
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    if (!this.form.name.trim() || !this.form.slug.trim()) {
      this.notifications.error('Name and slug are required');
      return;
    }
    this.saving.set(true);
    try {
      const dto = {
        name: this.form.name,
        slug: this.form.slug,
        domain: this.form.domain || undefined,
        currency: this.form.currency,
        locale: this.form.locale,
        timezone: this.form.timezone,
        status: this.form.status,
        contactEmail: this.form.contactEmail || undefined,
        theme: {
          primaryColor: this.form.primaryColor || undefined,
          accentColor: this.form.accentColor || undefined,
          logoUrl: this.form.logoUrl || undefined,
        },
      };
      if (this.isNew()) {
        const created = await this.storeService.create(dto);
        this.notifications.success('Store created');
        await this.storeContext.refresh();
        this.storeContext.setStore(created._id);
      } else {
        await this.storeService.update(this.id()!, dto);
        this.notifications.success('Store saved');
        await this.storeContext.refresh();
      }
      await this.router.navigateByUrl('/stores');
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
