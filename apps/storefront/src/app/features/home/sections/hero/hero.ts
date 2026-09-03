import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HERO_CONTENT } from '../../../../core/config/home-content.config';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink],
  template: `
    <section class="section-dark relative overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-2">
        <div class="container-store animate-fade-up flex flex-col justify-center gap-5 py-16 lg:py-0">
          <p class="eyebrow">{{ content.eyebrow }}</p>
          <h1 class="heading-xl max-w-lg">{{ content.title }}</h1>
          <p class="max-w-sm text-sm text-(--color-store-text-muted)">{{ content.description }}</p>
          <div class="mt-2 flex flex-wrap gap-3">
            <a [routerLink]="content.primaryCta.url" class="btn-primary">{{ content.primaryCta.label }}</a>
            <a [routerLink]="content.secondaryCta.url" class="btn-outline">{{ content.secondaryCta.label }}</a>
          </div>
        </div>
        <div class="relative min-h-[45vh] lg:min-h-[75vh]">
          <img [src]="content.image" alt="" class="absolute inset-0 h-full w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-black/60 lg:via-black/0"></div>
        </div>
      </div>
    </section>
  `,
})
export class HeroSection {
  protected readonly content = HERO_CONTENT;
}
