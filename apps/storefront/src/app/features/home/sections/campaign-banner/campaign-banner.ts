import { Component } from '@angular/core';
import { CAMPAIGN_BANNER } from '../../../../core/config/home-content.config';

const ICON_PATHS: Record<string, string> = {
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z',
  spark: 'M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4',
  lock: 'M6 11V8a6 6 0 1 1 12 0v3M5 11h14v9H5v-9Z',
};

@Component({
  selector: 'app-campaign-banner',
  template: `
    <section class="section-dark relative overflow-hidden">
      <img [src]="content.image" alt="" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-black/75"></div>
      <div class="container-store relative grid grid-cols-1 gap-8 py-14 sm:grid-cols-3">
        @for (item of content.items; track item.title) {
          <div class="flex flex-col items-center gap-2 text-center">
            <svg viewBox="0 0 24 24" fill="none" class="h-7 w-7 text-(--color-store-primary)">
              <path [attr.d]="iconPaths[item.icon]" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <p class="text-sm font-bold tracking-wide uppercase">{{ item.title }}</p>
            <p class="text-xs text-(--color-store-text-muted)">{{ item.description }}</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class CampaignBanner {
  protected readonly content = CAMPAIGN_BANNER;
  protected readonly iconPaths = ICON_PATHS;
}
