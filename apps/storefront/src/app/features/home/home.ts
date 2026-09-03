import { Component } from '@angular/core';
import { HeroSection } from './sections/hero/hero';
import { UspBar } from './sections/usp-bar/usp-bar';
import { FeaturedProducts } from './sections/featured-products/featured-products';
import { CampaignBanner } from './sections/campaign-banner/campaign-banner';
import { ShopByCategory } from './sections/shop-by-category/shop-by-category';
import { EditorialBanner } from './sections/editorial-banner/editorial-banner';
import { LOOKBOOK_CONTENT } from '../../core/config/home-content.config';

@Component({
  selector: 'app-home',
  imports: [HeroSection, UspBar, FeaturedProducts, CampaignBanner, ShopByCategory, EditorialBanner],
  template: `
    <app-hero-section />
    <app-usp-bar />
    <app-featured-products />
    <app-campaign-banner />
    <app-shop-by-category />
    <app-editorial-banner [content]="lookbook" />
  `,
})
export class Home {
  protected readonly lookbook = LOOKBOOK_CONTENT;
}
