import { Injectable } from '@angular/core';
import type { StoreThemeConfig } from '@ecom/types';
import { lighten, withAlpha } from './color-utils';

/**
 * Applies the active store's theme (set in the admin's Store editor —
 * primaryColor / accentColor / logoUrl) as CSS custom properties at runtime.
 * Components never hardcode colors; they only reference the --color-store-*
 * tokens defined in styles.css, so this is the single place a store's brand
 * actually reaches the page. `accentColor` is the store's dark base tone —
 * the whole near-black surface/border scale is derived from it so the page
 * stays coherent when a store picks a different base (e.g. near-navy).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  apply(theme: StoreThemeConfig | undefined): void {
    const root = document.documentElement.style;
    const primary = theme?.primaryColor || '#e2141f';
    const base = theme?.accentColor || '#0a0a0a';

    root.setProperty('--color-store-primary', primary);
    root.setProperty('--color-store-primary-hover', lighten(primary, 0.15));
    root.setProperty('--color-store-primary-soft', withAlpha(primary, 0.1));

    root.setProperty('--color-store-bg', base);
    root.setProperty('--color-store-surface', lighten(base, 0.05));
    root.setProperty('--color-store-surface-2', lighten(base, 0.09));
    root.setProperty('--color-store-border', lighten(base, 0.13));
    root.setProperty('--color-store-text-faint', lighten(base, 0.35));

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
}
