import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Store } from '@ecom/types';
import { STOREFRONT_CONFIG } from '../config/storefront.config';

/**
 * Resolves and holds the active store. Must finish loading before any other
 * storefront API call fires, since every one of them needs the store id
 * (see store-header.interceptor.ts) — wired up via an app initializer.
 */
@Injectable({ providedIn: 'root' })
export class StoreService {
  private readonly http = inject(HttpClient);

  readonly store = signal<Store | null>(null);
  readonly storeId = computed(() => this.store()?._id ?? null);
  readonly loaded = signal(false);

  private loadPromise: Promise<void> | null = null;

  load(): Promise<void> {
    if (!this.loadPromise) {
      this.loadPromise = firstValueFrom(
        this.http.get<Store>(`${STOREFRONT_CONFIG.apiBase}/store`, {
          params: { slug: STOREFRONT_CONFIG.storeSlug },
        }),
      )
        .then((store) => {
          this.store.set(store);
          if (store) this.applySeo(store);
        })
        .catch((err) => {
          console.error('Failed to resolve store', err);
        })
        .finally(() => this.loaded.set(true));
    }
    return this.loadPromise;
  }

  /**
   * Applies the store-level SEO defaults to the document: `<title>`,
   * `<meta name="description">`, `<meta name="keywords">`, and OG tags.
   * Individual pages may override these later with their own `seo` fields.
   */
  private applySeo(store: Store): void {
    const seo = store.seo;
    document.title = seo?.metaTitle || store.name;

    this.setMeta('description', seo?.metaDescription);
    this.setMeta('keywords', seo?.keywords?.join(', '));

    // Open Graph tags
    this.setMeta('og:title', seo?.metaTitle || store.name, true);
    this.setMeta('og:description', seo?.metaDescription, true);
    this.setMeta('og:image', seo?.ogImageUrl, true);
    this.setMeta('og:site_name', store.name, true);

    // Twitter Card tags
    this.setMeta('twitter:title', seo?.metaTitle || store.name);
    this.setMeta('twitter:description', seo?.metaDescription);
    this.setMeta('twitter:image', seo?.ogImageUrl);
  }

  /** Sets or updates a `<meta>` tag; removes it when `content` is empty. */
  private setMeta(name: string, content: string | undefined, isProperty = false): void {
    if (!content) return;
    const attr = isProperty ? 'property' : 'name';
    let tag = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  }
}
