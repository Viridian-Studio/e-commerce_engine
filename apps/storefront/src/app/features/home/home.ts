import { Component, computed, inject } from '@angular/core';
import { HeroSection } from './sections/hero/hero';
import { UspBar } from './sections/usp-bar/usp-bar';
import { FeaturedProducts } from './sections/featured-products/featured-products';
import { CampaignBanner } from './sections/campaign-banner/campaign-banner';
import { ShopByCategory } from './sections/shop-by-category/shop-by-category';
import { EditorialBanner } from './sections/editorial-banner/editorial-banner';
import { LOOKBOOK_CONTENT } from '../../core/config/home-content.config';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-home',
  imports: [HeroSection, UspBar, FeaturedProducts, CampaignBanner, ShopByCategory, EditorialBanner],
  template: `
    <app-hero-section />
    <app-usp-bar />
    <app-featured-products />
    <app-campaign-banner />
    <app-shop-by-category />
    <app-editorial-banner [content]="lookbook()" />
  `,
})
export class Home {
  private readonly i18n = inject(I18nService);
  protected readonly lookbook = computed(() => LOOKBOOK_CONTENT[this.i18n.lang()]);
}
