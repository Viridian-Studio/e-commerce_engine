import { Injectable } from '@angular/core';
import type { StoreThemeConfig } from '@ecom/types';
import { lighten, darken, withAlpha } from './color-utils';

/** Preset font options — kept in sync with the admin store editor. */
const FONT_PRESETS: { label: string; value: string; google?: string }[] = [
  { label: 'System default', value: '' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif', google: 'Inter:wght@400;500;600;700;800' },
  { label: 'Roboto', value: "'Roboto', system-ui, sans-serif", google: 'Roboto:wght@400;500;700' },
  { label: 'Open Sans', value: "'Open Sans', system-ui, sans-serif", google: 'Open+Sans:wght@400;600;700' },
  { label: 'Lato', value: 'Lato, system-ui, sans-serif', google: 'Lato:wght@400;700;900' },
  { label: 'Montserrat', value: 'Montserrat, system-ui, sans-serif', google: 'Montserrat:wght@400;600;700;800' },
  { label: 'Poppins', value: 'Poppins, system-ui, sans-serif', google: 'Poppins:wght@400;500;600;700' },
  { label: 'Playfair Display (serif)', value: "'Playfair Display', Georgia, serif", google: 'Playfair+Display:wght@400;700;900' },
  { label: 'Merriweather (serif)', value: 'Merriweather, Georgia, serif', google: 'Merriweather:wght@400;700' },
  { label: 'Source Code Pro (mono)', value: "'Source Code Pro', monospace", google: 'Source+Code+Pro:wght@400;600;700' },
];

/**
 * Applies the active store's theme (set in the admin's Store editor) as CSS
 * custom properties at runtime. Components never hardcode colors; they only
 * reference the --color-store-* tokens, so this is the single place a store's
 * brand actually reaches the page.
 *
 * `accentColor` is the store's base tone — the surface/border/text scale is
 * derived from it. In dark mode it's a near-black base; in light mode it's
 * inverted (the page background becomes light and text becomes dark).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme: StoreThemeConfig | undefined;
  private mediaListener: ((e: MediaQueryListEvent) => void) | null = null;

  apply(theme: StoreThemeConfig | undefined): void {
    this.currentTheme = theme;
    this.applyInternal(theme);
    this.setupAutoListener(theme);
  }

  private applyInternal(theme: StoreThemeConfig | undefined): void {
    const root = document.documentElement.style;
    const primary = theme?.primaryColor || '#e2141f';
    const accent = theme?.accentColor || '#0a0a0a';
    const appearance = theme?.appearance || 'dark';
    const isDark = appearance === 'dark' || (appearance === 'auto' && this.prefersDark());

    // --- Colors ---
    root.setProperty('--color-store-primary', primary);
    root.setProperty('--color-store-primary-hover', lighten(primary, 0.15));
    root.setProperty('--color-store-primary-soft', withAlpha(primary, 0.1));

    if (isDark) {
      root.setProperty('--color-store-bg', accent);
      root.setProperty('--color-store-surface', lighten(accent, 0.05));
      root.setProperty('--color-store-surface-2', lighten(accent, 0.09));
      root.setProperty('--color-store-border', lighten(accent, 0.13));
      root.setProperty('--color-store-text', '#f5f5f5');
      root.setProperty('--color-store-text-muted', '#9a9a9f');
      root.setProperty('--color-store-text-faint', lighten(accent, 0.35));
      root.setProperty('color-scheme', 'dark');
    } else {
      const bg = lighten(accent, 0.97);
      root.setProperty('--color-store-bg', bg);
      root.setProperty('--color-store-surface', lighten(accent, 0.99));
      root.setProperty('--color-store-surface-2', lighten(accent, 0.95));
      root.setProperty('--color-store-border', lighten(accent, 0.88));
      root.setProperty('--color-store-text', darken(accent, 0.85));
      root.setProperty('--color-store-text-muted', lighten(accent, 0.45));
      root.setProperty('--color-store-text-faint', lighten(accent, 0.65));
      root.setProperty('color-scheme', 'light');
    }

    // --- Typography ---
    const bodyFont = theme?.fontFamily || '';
    const headingFont = theme?.headingFontFamily || bodyFont || 'inherit';
    if (bodyFont) {
      root.setProperty('--font-sans', bodyFont);
      this.loadGoogleFont(bodyFont);
    } else {
      root.removeProperty('--font-sans');
    }
    root.setProperty('--font-heading', headingFont);
    if (headingFont && headingFont !== 'inherit') {
      this.loadGoogleFont(headingFont);
    }

    // --- Border radius ---
    const radius = theme?.borderRadius ?? 0;
    if (radius < 0) {
      root.setProperty('--radius-store', '9999px');
    } else {
      root.setProperty('--radius-store', `${radius}px`);
    }

    // --- Favicon ---
    if (theme?.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = theme.faviconUrl;
    }
  }

  private prefersDark(): boolean {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  }

  /** Re-applies the theme when the OS color scheme changes (only for `auto` mode). */
  private setupAutoListener(theme: StoreThemeConfig | undefined): void {
    // Remove any previous listener
    if (this.mediaListener) {
      window.matchMedia?.('(prefers-color-scheme: dark)').removeEventListener('change', this.mediaListener);
      this.mediaListener = null;
    }
    if (theme?.appearance !== 'auto') return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    this.mediaListener = () => this.applyInternal(this.currentTheme);
    mq.addEventListener('change', this.mediaListener);
  }

  /** Loads a Google Font family if the given font stack matches a known preset. */
  private loadGoogleFont(fontStack: string): void {
    const preset = FONT_PRESETS.find((p) => p.value === fontStack);
    if (!preset?.google) return;
    const href = `https://fonts.googleapis.com/css2?family=${preset.google}&display=swap`;
    // Avoid duplicate <link> tags
    if (document.querySelector(`link[data-google-font="${preset.google}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset['googleFont'] = preset.google;
    document.head.appendChild(link);
  }
}
