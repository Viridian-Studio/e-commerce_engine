import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CAMPAIGN_BANNER, PROMO_TILES } from '../../../../core/config/home-content.config';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { TemplateService } from '../../../../core/theme/template.service';

const ICON_PATHS: Record<string, string> = {
  shield: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z',
  spark: 'M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4',
  lock: 'M6 11V8a6 6 0 1 1 12 0v3M5 11h14v9H5v-9Z',
};

/**
 * Mid-page campaign slot. `band` is the dark trust-badge strip the editorial
 * templates use; `tiles` is the row of colourful promo cards a catalog store
 * runs its campaigns on.
 */
@Component({
  selector: 'app-campaign-banner',
  imports: [RouterLink],
  template: `
    @if (tiles()) {
      <section class="section-dark section-pad">
        <div class="container-store grid gap-4 sm:grid-cols-3">
          @for (tile of promos(); track tile.title) {
            <a
              [routerLink]="tile.cta.url"
              class="group relative flex min-h-[150px] flex-col justify-center overflow-hidden p-6 text-white"
              [style.background]="tile.tone"
              [style.border-radius]="'var(--radius-store, 0)'"
            >
              <p class="text-[11px] font-semibold tracking-wide text-white/80">{{ tile.label }}</p>
              <p class="mt-1 text-xl leading-tight font-bold">{{ tile.title }}</p>
              <p class="mt-1 text-xs text-white/85">{{ tile.description }}</p>
              <span class="mt-3 text-xs font-semibold underline underline-offset-4">{{ tile.cta.label }}</span>
              <img
                [src]="tile.image"
                alt=""
                class="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full object-cover opacity-30 transition-transform duration-500 group-hover:scale-110"
              />
            </a>
          }
        </div>
      </section>
    } @else {
      <section class="section-dark relative overflow-hidden">
        <img [src]="content().image" alt="" class="photo-tone absolute inset-0 h-full w-full object-cover" />
        <div class="absolute inset-0 bg-black/75"></div>
        <div class="container-store relative grid grid-cols-1 gap-8 py-14 sm:grid-cols-3">
          @for (item of content().items; track item.title) {
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
    }
  `,
})
export class CampaignBanner {
  private readonly i18n = inject(I18nService);
  private readonly templates = inject(TemplateService);

  protected readonly content = computed(() => CAMPAIGN_BANNER[this.i18n.lang()]);
  protected readonly promos = computed(() => PROMO_TILES[this.i18n.lang()]);
  protected readonly tiles = computed(() => this.templates.layout().campaign === 'tiles');
  protected readonly iconPaths = ICON_PATHS;
}
