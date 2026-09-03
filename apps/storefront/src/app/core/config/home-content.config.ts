import type { Lang } from '../i18n/translations';

/**
 * Homepage editorial content: hero copy/imagery, the "built for fans" banner
 * and the lookbook teaser. This is presentation-only content with no
 * commerce data in it, so it's kept as a typed config object here instead of
 * hardcoded into the section components — the same components render fine
 * for a different theme that swaps this file out. Keyed by language so the
 * homepage follows the same EN/HU switch as the rest of the chrome.
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

export const HERO_CONTENT: Record<Lang, HeroContent> = {
  hu: {
    eyebrow: 'Új kollekció 2025',
    title: 'Utcai divat határok nélkül',
    description: 'Prémium minőségű ruházat és kiegészítők valódi szurkolóknak. Tűnj ki. Légy más.',
    image: 'https://picsum.photos/seed/ultras-hero/1400/1600',
    primaryCta: { label: 'Vásárlás', url: '/category/hoodies' },
    secondaryCta: { label: 'Lookbook megtekintése', url: '/collection/new-arrivals' },
  },
  en: {
    eyebrow: 'New Collection 2025',
    title: 'Streetwear Without Limits',
    description: 'Premium clothing and accessories for real fans. Stand out. Be different.',
    image: 'https://picsum.photos/seed/ultras-hero/1400/1600',
    primaryCta: { label: 'Shop Now', url: '/category/hoodies' },
    secondaryCta: { label: 'View Lookbook', url: '/collection/new-arrivals' },
  },
};

export const USP_ITEMS: Record<Lang, UspItem[]> = {
  hu: [
    { icon: 'globe', title: 'Nemzetközi szállítás', description: 'Több mint 100 országba szállítunk' },
    { icon: 'return', title: '14 napos visszaküldés', description: 'Egyszerű csere és visszaküldés' },
    { icon: 'star', title: 'Prémium minőség', description: 'Kiváló alapanyagok és nyomtatás' },
    { icon: 'lock', title: 'Biztonságos fizetés', description: '100%-ban biztonságos fizetési mód' },
  ],
  en: [
    { icon: 'globe', title: 'Worldwide Shipping', description: 'We ship to over 100 countries' },
    { icon: 'return', title: '14-Day Returns', description: 'Hassle-free returns & exchanges' },
    { icon: 'star', title: 'Premium Quality', description: 'Top quality materials & print' },
    { icon: 'lock', title: 'Secure Checkout', description: '100% secure payment' },
  ],
};

export const CAMPAIGN_BANNER: Record<Lang, CampaignBannerContent> = {
  hu: {
    image: 'https://picsum.photos/seed/ultras-editorial/1600/700',
    items: [
      { icon: 'shield', title: 'Szurkolóknak', description: 'Szurkolók által, szurkolóknak tervezve.' },
      { icon: 'spark', title: 'Limitált darabok', description: 'Exkluzív dobások — ne maradj le róluk.' },
      { icon: 'lock', title: 'Biztonságos fizetés', description: 'Az adataid mindig védve vannak.' },
    ],
  },
  en: {
    image: 'https://picsum.photos/seed/ultras-editorial/1600/700',
    items: [
      { icon: 'shield', title: 'Built for Fans', description: 'Designed by fans, for fans.' },
      { icon: 'spark', title: 'Limited Editions', description: "Exclusive drops, don't miss out." },
      { icon: 'lock', title: 'Secure Payment', description: 'Your data is always protected.' },
    ],
  },
};

export const LOOKBOOK_CONTENT: Record<Lang, EditorialContent> = {
  hu: {
    title: 'Lookbook 2025',
    description: 'Nézd meg a kollekciót élőben.',
    image: 'https://picsum.photos/seed/ultras-lookbook/1600/900',
    cta: { label: 'Lookbook megtekintése', url: '/collection/new-arrivals' },
  },
  en: {
    title: 'Lookbook 2025',
    description: 'See the collection in action.',
    image: 'https://picsum.photos/seed/ultras-lookbook/1600/900',
    cta: { label: 'View Lookbook', url: '/collection/new-arrivals' },
  },
};
