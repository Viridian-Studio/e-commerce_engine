import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { EditorialContent } from '../../../../core/config/home-content.config';

@Component({
  selector: 'app-editorial-banner',
  imports: [RouterLink],
  template: `
    <section class="section-dark relative flex min-h-[380px] items-end overflow-hidden sm:min-h-[440px]">
      <img [src]="content().image" alt="" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"></div>
      <div class="container-store relative py-10">
        <h2 class="heading-lg max-w-md">{{ content().title }}</h2>
        <p class="mt-3 max-w-sm text-sm text-(--color-store-text-muted)">{{ content().description }}</p>
        @if (showCta()) {
          <a [routerLink]="content().cta.url" class="btn-primary mt-5 inline-flex">{{ content().cta.label }}</a>
        }
      </div>
    </section>
  `,
})
export class EditorialBanner {
  readonly content = input.required<EditorialContent>();
  readonly showCta = input(true);
}
