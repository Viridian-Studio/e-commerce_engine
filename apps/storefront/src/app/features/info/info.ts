import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { Breadcrumb, type BreadcrumbItem } from '../../shared/components/breadcrumb/breadcrumb';
import { INFO_PAGES, type InfoPageContent } from './info-data';

/**
 * Renders a static customer-information page based on the `:slug` route
 * parameter. Content is looked up from the local `INFO_PAGES` registry and
 * served in the active language.
 */
@Component({
  selector: 'app-info-page',
  imports: [RouterLink, Breadcrumb],
  template: `
    <section class="section-dark py-10">
      <div class="container-store">
        <app-breadcrumb [items]="breadcrumbs()" />

        @if (page()) {
          <h1 class="heading-xl mt-4">{{ page()!.title }}</h1>
          <div class="mt-8 max-w-3xl space-y-8">
            @for (section of page()!.sections; track $index) {
              <div>
                @if (section.heading) {
                  <h2 class="heading-md mb-2 text-base">{{ section.heading }}</h2>
                }
                <div class="prose-store text-sm leading-relaxed text-(--color-store-text-muted)" [innerHTML]="section.body"></div>
              </div>
            }
          </div>
        } @else {
          <div class="mt-20 flex flex-col items-center gap-4 text-center">
            <h1 class="heading-lg">404</h1>
            <p class="text-sm text-(--color-store-text-muted)">A keresett oldal nem található.</p>
            <a routerLink="/" class="btn-primary mt-2">Vissza a boltba</a>
          </div>
        }
      </div>
    </section>
  `,
})
export class InfoPage {
  private readonly i18n = inject(I18nService);

  readonly slug = input.required<string>();

  protected readonly page = computed<InfoPageContent | null>(() => {
    const entry = INFO_PAGES[this.slug()];
    if (!entry) return null;
    return entry.content[this.i18n.lang()];
  });

  protected readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const home = this.i18n.lang() === 'hu' ? 'Kezdőlap' : 'Home';
    return [{ label: home, url: '/' }, { label: this.page()?.title ?? '—' }];
  });
}
