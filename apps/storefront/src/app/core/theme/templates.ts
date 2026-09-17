import type { StoreAppearance, StoreTemplateId } from '@ecom/types';

/**
 * Storefront layout templates.
 *
 * A template is the *shape* of the store — how dense the product grid is, how
 * the header is arranged, what the homepage leads with. The store's own theme
 * (colors, fonts, radius, set in the admin's Appearance tab) is layered on top
 * and always wins; `defaults` here only fill in what the store left blank.
 *
 * The split is deliberate: everything purely visual (type scale, spacing, card
 * aspect, column counts) travels as CSS variables under `[data-template=...]`
 * in styles.css, so components never branch on a template id for styling.
 * Only genuinely *structural* differences — a different header, a different
 * hero, a different section order — surface as `layout` flags that components
 * read through TemplateService.
 */

/** Homepage sections, in the order a template lists them. */
export type HomeSectionId = 'hero' | 'usp' | 'featured' | 'campaign' | 'categories' | 'editorial';

export interface TemplateLayout {
  /** `nav` centres the category navigation; `search` gives a full-width search field. */
  header: 'nav' | 'search';
  /**
   * `split` is a tall text/photo hero, `strip` a slim promo band, `tiles` the
   * megastore arrangement: category rail beside a banner and two promo cards.
   */
  hero: 'split' | 'strip' | 'tiles';
  /**
   * `editorial` is image-first with colour swatches; `compact` adds an
   * add-to-cart button on the tile; `detailed` also shows stock availability
   * and puts the tile on its own card surface.
   */
  productCard: 'editorial' | 'compact' | 'detailed';
  /** `photo` shows tall lifestyle category cards; `circle` a row of round chips. */
  categoryCards: 'photo' | 'circle';
  /** `band` is the dark trust-badge strip; `tiles` a row of colourful promo cards. */
  campaign: 'band' | 'tiles';
  /** Homepage section order. */
  sections: HomeSectionId[];
  /** Products per page on category / collection / brand listings. */
  pageSize: number;
  /** Products in the homepage "featured" rail — one full grid row. */
  featuredCount: number;
}

export interface TemplateDefinition {
  id: StoreTemplateId;
  label: string;
  description: string;
  /** Theme token fallbacks — used only where the store's own theme is unset. */
  defaults: {
    primaryColor: string;
    accentColor: string;
    appearance: StoreAppearance;
    borderRadius: number;
    fontFamily: string;
    headingFontFamily: string;
  };
  layout: TemplateLayout;
}

export const DEFAULT_TEMPLATE_ID: StoreTemplateId = 'bold';

export const TEMPLATES: Record<StoreTemplateId, TemplateDefinition> = {
  bold: {
    id: 'bold',
    label: 'Bold',
    description: 'Sötét, nagybetűs, editorial. Streetwear, merch, sport.',
    defaults: {
      primaryColor: '#e2141f',
      accentColor: '#0a0a0a',
      appearance: 'dark',
      borderRadius: 0,
      fontFamily: '',
      headingFontFamily: '',
    },
    layout: {
      header: 'nav',
      hero: 'split',
      productCard: 'editorial',
      categoryCards: 'photo',
      campaign: 'band',
      sections: ['hero', 'usp', 'featured', 'campaign', 'categories', 'editorial'],
      pageSize: 9,
      featuredCount: 5,
    },
  },
  market: {
    id: 'market',
    label: 'Market',
    description: 'Világos, sűrű katalógus. Keresés-vezérelt fejléc, sok termék.',
    defaults: {
      primaryColor: '#1d4ed8',
      accentColor: '#16181d',
      appearance: 'light',
      borderRadius: 4,
      fontFamily: 'Inter, system-ui, sans-serif',
      headingFontFamily: '',
    },
    layout: {
      header: 'search',
      hero: 'strip',
      productCard: 'compact',
      categoryCards: 'photo',
      campaign: 'band',
      sections: ['hero', 'categories', 'usp', 'featured', 'campaign'],
      pageSize: 24,
      featuredCount: 12,
    },
  },
  tech: {
    id: 'tech',
    label: 'Tech áruház',
    description:
      'Alza-stílusú megastore: nagy kereső, kategória-sáv és -oldalsáv, kártyás termékcsempék készletinfóval. Elektronika, műszaki cikk, nagy választék.',
    defaults: {
      primaryColor: '#0f6ab4',
      accentColor: '#111827',
      appearance: 'light',
      borderRadius: 8,
      fontFamily: 'Inter, system-ui, sans-serif',
      headingFontFamily: '',
    },
    layout: {
      header: 'search',
      hero: 'tiles',
      productCard: 'detailed',
      categoryCards: 'circle',
      campaign: 'tiles',
      sections: ['hero', 'categories', 'featured', 'campaign', 'usp'],
      pageSize: 30,
      featuredCount: 10,
    },
  },
};

/** Resolves a (possibly missing or unknown) stored id to a real template. */
export function resolveTemplate(id: StoreTemplateId | undefined): TemplateDefinition {
  return TEMPLATES[id as StoreTemplateId] ?? TEMPLATES[DEFAULT_TEMPLATE_ID];
}
