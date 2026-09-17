import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HERO_CONTENT, PROMO_TILES } from '../../../../core/config/home-content.config';
import { I18nService } from '../../../../core/i18n/i18n.service';
import { CategoryService, type CategoryNode } from '../../../../core/api/category.service';
import { TemplateService } from '../../../../core/theme/template.service';
import { TranslatePipe } from '../../../../core/i18n/translate.pipe';

/**
 * The homepage opener, in the three shapes a template can ask for:
 *
 * - `split`  — tall editorial hero, copy beside a full-bleed photo.
 * - `strip`  — slim promo band for catalog stores that want products above the fold.
 * - `tiles`  — megastore arrangement: category rail, main banner, promo cards.
 */
/**
 * The rail wants a full column of links. A store with only a couple of top
 * level categories would leave it half empty, so in that case it drops one
 * level down and lists the children instead.
 */
function railCategories(tree: CategoryNode[]): CategoryNode[] {
  const RAIL_MIN = 5;
  if (tree.length >= RAIL_MIN) return tree.slice(0, 9);
  const expanded = tree.flatMap((top) => (top.children.length > 0 ? top.children : [top]));
  return (expanded.length > tree.length ? expanded : tree).slice(0, 9);
}

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink, TranslatePipe],
  template: `
    @switch (variant()) {
      @case ('tiles') {
        <section class="section-dark">
          <div class="container-store grid gap-4 py-4 lg:grid-cols-[minmax(0,230px)_minmax(0,1fr)_minmax(0,290px)]">
            <!-- Category rail — the shortcut a catalog shopper expects first. -->
            <nav class="card-tile hidden lg:block">
              <p class="mb-1 px-2 text-xs font-semibold text-(--color-store-text-faint)">{{ 'nav.allCategories' | t }}</p>
              @for (category of categories(); track category._id) {
                <a
                  [routerLink]="['/category', category.slug]"
                  class="flex items-center justify-between gap-2 px-2 py-1.5 text-sm text-(--color-store-text-muted) transition-colors hover:text-(--color-store-primary)"
                >
                  <span class="truncate">{{ category.name }}</span>
                  <svg viewBox="0 0 24 24" fill="none" class="h-3.5 w-3.5 shrink-0"><path stroke="currentColor" stroke-width="2" d="m9 6 6 6-6 6" /></svg>
                </a>
              }
            </nav>

            <a
              [routerLink]="content().primaryCta.url"
              class="group relative flex min-h-[260px] items-end overflow-hidden sm:min-h-[340px]"
              [style.border-radius]="'var(--radius-store, 0)'"
            >
              <img [src]="content().image" alt="" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent"></div>
              <div class="relative max-w-md p-6 text-white sm:p-8">
                <p class="text-xs font-semibold tracking-wide text-white/80">{{ content().eyebrow }}</p>
                <h1 class="mt-2 text-2xl leading-tight font-bold sm:text-4xl">{{ content().title }}</h1>
                <p class="mt-2 hidden text-sm text-white/80 sm:block">{{ content().description }}</p>
                <span class="btn-primary mt-4 inline-flex">{{ content().primaryCta.label }}</span>
              </div>
            </a>

            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              @for (tile of promos(); track tile.title) {
                <a
                  [routerLink]="tile.cta.url"
                  class="group relative flex min-h-[120px] flex-col justify-center overflow-hidden p-5 text-white sm:min-h-[162px]"
                  [style.background]="tile.tone"
                  [style.border-radius]="'var(--radius-store, 0)'"
                >
                  <p class="text-[11px] font-semibold tracking-wide text-white/80">{{ tile.label }}</p>
                  <p class="mt-1 text-lg leading-tight font-bold">{{ tile.title }}</p>
                  <p class="mt-1 text-xs text-white/85">{{ tile.description }}</p>
                  <span class="mt-2 text-xs font-semibold underline underline-offset-4">{{ tile.cta.label }}</span>
                  <img
                    [src]="tile.image"
                    alt=""
                    class="pointer-events-none absolute -right-6 -bottom-6 h-24 w-24 rounded-full object-cover opacity-30 transition-transform duration-500 group-hover:scale-110"
                  />
                </a>
              }
            </div>
          </div>
        </section>
      }
      @case ('strip') {
        <section class="section-dark">
          <div class="container-store py-4">
            <a
              [routerLink]="content().primaryCta.url"
              class="group relative flex min-h-[180px] items-center overflow-hidden sm:min-h-[220px]"
              [style.border-radius]="'var(--radius-store, 0)'"
            >
              <img [src]="content().image" alt="" class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
              <div class="relative max-w-lg px-6 text-white sm:px-10">
                <p class="text-xs font-semibold tracking-wide text-white/80">{{ content().eyebrow }}</p>
                <h1 class="mt-1 text-2xl leading-tight font-bold sm:text-3xl">{{ content().title }}</h1>
                <span class="btn-primary mt-4 inline-flex">{{ content().primaryCta.label }}</span>
              </div>
            </a>
          </div>
        </section>
      }
      @default {
        <section class="section-dark relative overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2">
            <div class="container-store animate-fade-up flex flex-col justify-center gap-5 py-16 lg:py-0">
              <p class="eyebrow">{{ content().eyebrow }}</p>
              <h1 class="heading-xl max-w-lg">{{ content().title }}</h1>
              <p class="max-w-sm text-sm text-(--color-store-text-muted)">{{ content().description }}</p>
              <div class="mt-2 flex flex-wrap gap-3">
                <a [routerLink]="content().primaryCta.url" class="btn-primary">{{ content().primaryCta.label }}</a>
                <a [routerLink]="content().secondaryCta.url" class="btn-outline">{{ content().secondaryCta.label }}</a>
              </div>
            </div>
            <div class="relative min-h-[45vh] lg:min-h-[75vh]">
              <img [src]="content().image" alt="" class="photo-tone absolute inset-0 h-full w-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-black/60 lg:via-black/0"></div>
            </div>
          </div>
        </section>
      }
    }
  `,
})
export class HeroSection {
  private readonly i18n = inject(I18nService);
  private readonly templates = inject(TemplateService);
  private readonly categoryService = inject(CategoryService);

  protected readonly content = computed(() => HERO_CONTENT[this.i18n.lang()]);
  protected readonly promos = computed(() => PROMO_TILES[this.i18n.lang()].slice(0, 2));
  protected readonly variant = computed(() => this.templates.layout().hero);
  protected readonly categories = signal<CategoryNode[]>([]);

  constructor() {
    if (this.variant() === 'tiles') {
      void this.categoryService.tree().then((tree) => this.categories.set(railCategories(tree)));
    }
  }
}
