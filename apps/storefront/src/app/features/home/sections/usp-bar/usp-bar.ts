import { Component } from '@angular/core';
import { USP_ITEMS } from '../../../../core/config/home-content.config';

const ICON_PATHS: Record<string, string> = {
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 4 5.7 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.7-4-9s1.5-6.5 4-9Z',
  return: 'M4 4v6h6M20 20v-6h-6M4.5 15a8 8 0 0 0 14.5 2M19.5 9A8 8 0 0 0 5 7',
  star: 'M12 3.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L12 3.5Z',
  lock: 'M6 11V8a6 6 0 1 1 12 0v3M5 11h14v9H5v-9Z',
};

@Component({
  selector: 'app-usp-bar',
  template: `
    <section class="section-light py-10">
      <div class="container-store grid grid-cols-2 gap-6 sm:grid-cols-4">
        @for (item of items; track item.title) {
          <div class="flex items-center gap-3">
            <svg viewBox="0 0 24 24" fill="none" class="h-7 w-7 shrink-0 text-(--color-store-ink)">
              <path [attr.d]="iconPaths[item.icon]" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div>
              <p class="text-xs font-bold tracking-wide uppercase">{{ item.title }}</p>
              <p class="text-xs text-(--color-store-ink-muted)">{{ item.description }}</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class UspBar {
  protected readonly items = USP_ITEMS;
  protected readonly iconPaths = ICON_PATHS;
}
