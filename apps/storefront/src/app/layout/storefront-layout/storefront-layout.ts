import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { CartDrawer } from '../cart-drawer/cart-drawer';
import { AnnouncementBar } from '../announcement-bar/announcement-bar';
import { StoreService } from '../../core/api/store.service';

@Component({
  selector: 'app-storefront-layout',
  imports: [RouterOutlet, Header, Footer, CartDrawer, AnnouncementBar],
  host: { class: 'block' },
  template: `
    @if (maintenanceMode()) {
      <div class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-(--color-store-border)">
          <svg viewBox="0 0 24 24" fill="none" class="h-8 w-8 text-(--color-store-text-muted)">
            <path stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M12 3v3m0 12v3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M3 12h3m12 0h3M5.6 18.4l2.1-2.1m8.6-8.6 2.1-2.1" />
          </svg>
        </div>
        <div class="space-y-2">
          <p class="eyebrow">Karbantartás</p>
          <h1 class="heading-xl">Hamarosan visszatérünk</h1>
          <p class="mx-auto max-w-md text-sm text-(--color-store-text-muted)">{{ maintenanceMessage() }}</p>
        </div>
      </div>
    } @else {
      <app-announcement-bar />
      <app-header />
      <main class="min-h-[60vh]">
        <router-outlet />
      </main>
      <app-footer />
      <app-cart-drawer />
    }
  `,
})
export class StorefrontLayout {
  private readonly storeService = inject(StoreService);

  protected readonly maintenanceMode = computed(
    () => this.storeService.store()?.settings?.['maintenance_enabled'] === true,
  );

  protected readonly maintenanceMessage = computed(() => {
    const msg = this.storeService.store()?.settings?.['maintenance_message'];
    return typeof msg === 'string' && msg.trim()
      ? msg
      : 'A webáruház jelenleg karbantartás alatt áll. Kérjük, térj vissza később.';
  });
}
