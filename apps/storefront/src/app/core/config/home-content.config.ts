/**
 * Homepage editorial content: hero copy/imagery, the "built for fans" banner
 * and the lookbook teaser. This is presentation-only content with no
 * commerce data in it, so it's kept as a typed config object here instead of
 * hardcoded into the section components — the same components render fine
 * for a different theme that swaps this file out.
 */
export interface HeroContent {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  primaryCta: { label: string; url: string };
  secondaryCta: { label: string; url: string };
}

export interface UspItem {
  icon: 'globe' | 'return' | 'star' | 'lock';
  title: string;
  description: string;
}

export interface EditorialContent {
  title: string;
  description: string;
  image: string;
  cta: { label: string; url: string };
}

export interface CampaignBannerItem {
  icon: 'shield' | 'spark' | 'lock';
  title: string;
  description: string;
}

export interface CampaignBannerContent {
  image: string;
  items: CampaignBannerItem[];
}

// Copy is in Hungarian — the first market for this storefront instance. A
// different locale/theme swaps this file, not the section components.
export const HERO_CONTENT: HeroContent = {
  eyebrow: 'Új kollekció 2025',
  title: 'Utcai divat határok nélkül',
  description: 'Prémium minőségű ruházat és kiegészítők valódi szurkolóknak. Tűnj ki. Légy más.',
  image: 'https://picsum.photos/seed/ultras-hero/1400/1600',
  primaryCta: { label: 'Vásárlás', url: '/category/hoodies' },
  secondaryCta: { label: 'Lookbook megtekintése', url: '/collection/new-arrivals' },
};

export const USP_ITEMS: UspItem[] = [
  { icon: 'globe', title: 'Nemzetközi szállítás', description: 'Több mint 100 országba szállítunk' },
  { icon: 'return', title: '14 napos visszaküldés', description: 'Egyszerű csere és visszaküldés' },
  { icon: 'star', title: 'Prémium minőség', description: 'Kiváló alapanyagok és nyomtatás' },
  { icon: 'lock', title: 'Biztonságos fizetés', description: '100%-ban biztonságos fizetési mód' },
];

export const CAMPAIGN_BANNER: CampaignBannerContent = {
  image: 'https://picsum.photos/seed/ultras-editorial/1600/700',
  items: [
    { icon: 'shield', title: 'Szurkolóknak', description: 'Szurkolók által, szurkolóknak tervezve.' },
    { icon: 'spark', title: 'Limitált darabok', description: 'Exkluzív dobások — ne maradj le róluk.' },
    { icon: 'lock', title: 'Biztonságos fizetés', description: 'Az adataid mindig védve vannak.' },
  ],
};

export const LOOKBOOK_CONTENT: EditorialContent = {
  title: 'Lookbook 2025',
  description: 'Nézd meg a kollekciót élőben.',
  image: 'https://picsum.photos/seed/ultras-lookbook/1600/900',
  cta: { label: 'Lookbook megtekintése', url: '/collection/new-arrivals' },
};
