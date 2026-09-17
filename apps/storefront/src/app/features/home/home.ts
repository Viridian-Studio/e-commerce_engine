import { Component, computed, inject } from '@angular/core';
import { HeroSection } from './sections/hero/hero';
import { UspBar } from './sections/usp-bar/usp-bar';
import { FeaturedProducts } from './sections/featured-products/featured-products';
import { CampaignBanner } from './sections/campaign-banner/campaign-banner';
import { ShopByCategory } from './sections/shop-by-category/shop-by-category';
import { EditorialBanner } from './sections/editorial-banner/editorial-banner';
import { LOOKBOOK_CONTENT } from '../../core/config/home-content.config';
import { I18nService } from '../../core/i18n/i18n.service';
import { TemplateService } from '../../core/theme/template.service';

/**
 * The homepage is just the template's section list, rendered in order — a
 * catalog store leads with categories and products, an editorial one with a
 * tall hero and a lookbook. Sections a template leaves out never render.
 */
@Component({
  selector: 'app-home',
  imports: [HeroSection, UspBar, FeaturedProducts, CampaignBanner, ShopByCategory, EditorialBanner],
  template: `
    @for (section of sections(); track section) {
      @switch (section) {
        @case ('hero') {
          <app-hero-section />
        }
        @case ('usp') {
          <app-usp-bar />
        }
        @case ('featured') {
          <app-featured-products />
        }
        @case ('campaign') {
          <app-campaign-banner />
        }
        @case ('categories') {
          <app-shop-by-category />
        }
        @case ('editorial') {
          <app-editorial-banner [content]="lookbook()" />
        }
      }
    }
  `,
})
export class Home {
  private readonly i18n = inject(I18nService);
  private readonly templates = inject(TemplateService);

  protected readonly sections = computed(() => this.templates.layout().sections);
  protected readonly lookbook = computed(() => LOOKBOOK_CONTENT[this.i18n.lang()]);
}
