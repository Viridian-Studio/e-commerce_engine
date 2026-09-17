import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { StoreAppearance, StoreStatus, StoreTemplateId } from '@ecom/types';
import { StoreService } from '../../../core/services/store.service';
import { StoreContextService } from '../../../core/store-context.service';
import { NotificationService } from '../../../core/notification.service';
import { extractErrorMessage } from '../../../core/http-error';

/** Preset font options — kept in sync with the storefront ThemeService. */
const FONT_PRESETS: { label: string; value: string }[] = [
  { label: 'System default', value: '' },
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Roboto', value: "'Roboto', system-ui, sans-serif" },
  { label: 'Open Sans', value: "'Open Sans', system-ui, sans-serif" },
  { label: 'Lato', value: 'Lato, system-ui, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, system-ui, sans-serif' },
  { label: 'Poppins', value: 'Poppins, system-ui, sans-serif' },
  { label: 'Playfair Display (serif)', value: "'Playfair Display', Georgia, serif" },
  { label: 'Merriweather (serif)', value: 'Merriweather, Georgia, serif' },
  { label: 'Source Code Pro (mono)', value: "'Source Code Pro', monospace" },
];

/**
 * Storefront layout templates, as the picker presents them — kept in sync with
 * the storefront's own `core/theme/templates.ts`, which owns the real layout
 * rules. `preset` mirrors that template's defaults so "apply preset colours"
 * lands the store on the look the template was designed around.
 */
const TEMPLATE_PRESETS: {
  id: StoreTemplateId;
  label: string;
  description: string;
  preset: { primaryColor: string; accentColor: string; appearance: StoreAppearance; borderRadius: number; fontFamily: string };
  /** What the live preview draws — mirrors the storefront template's `layout`. */
  layout: {
    header: 'nav' | 'search';
    hero: 'split' | 'strip' | 'tiles';
    cols: number;
    cardSurface: boolean;
    uppercase: boolean;
  };
}[] = [
  {
    id: 'bold',
    label: 'Bold',
    description: 'Sötét, nagybetűs, editorial. Nagy hero, 4 oszlopos rács. Streetwear, merch, sport.',
    preset: { primaryColor: '#e2141f', accentColor: '#0a0a0a', appearance: 'dark', borderRadius: 0, fontFamily: '' },
    layout: { header: 'nav', hero: 'split', cols: 3, cardSurface: false, uppercase: true },
  },
  {
    id: 'market',
    label: 'Market',
    description: 'Világos, sűrű katalógus. Keresős fejléc, slim banner, 6 oszlopos rács.',
    preset: { primaryColor: '#1d4ed8', accentColor: '#16181d', appearance: 'light', borderRadius: 4, fontFamily: 'Inter, system-ui, sans-serif' },
    layout: { header: 'search', hero: 'strip', cols: 4, cardSurface: false, uppercase: false },
  },
  {
    id: 'tech',
    label: 'Tech áruház',
    description: 'Alza-stílus: nagy kereső, kategória-sáv és -oldalsáv, kártyás csempék készletinfóval, promo tile-ok.',
    preset: { primaryColor: '#0f6ab4', accentColor: '#111827', appearance: 'light', borderRadius: 8, fontFamily: 'Inter, system-ui, sans-serif' },
    layout: { header: 'search', hero: 'tiles', cols: 4, cardSurface: true, uppercase: false },
  },
];

type Tab = 'general' | 'appearance' | 'announcement' | 'payments' | 'seo';

interface StoreForm {
  name: string;
  slug: string;
  domain: string;
  currency: string;
  locale: string;
  timezone: string;
  status: StoreStatus;
  contactEmail: string;
  // Theme
  templateId: StoreTemplateId;
  primaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  appearance: StoreAppearance;
  fontFamily: string;
  headingFontFamily: string;
  borderRadius: number;
  // Announcement bar
  announcementEnabled: boolean;
  announcementText: string;
  announcementColor: string;
  announcementBackground: string;
  // Stripe
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  // SEO
  seoMetaTitle: string;
  seoMetaDescription: string;
  seoOgImageUrl: string;
  seoKeywords: string;
}

function emptyForm(): StoreForm {
  return {
    name: '',
    slug: '',
    domain: '',
    currency: 'USD',
    locale: 'en-US',
    timezone: 'UTC',
    status: 'active' as StoreStatus,
    contactEmail: '',
    templateId: 'bold',
    primaryColor: '#6366f1',
    accentColor: '#111111',
    logoUrl: '',
    faviconUrl: '',
    appearance: 'dark',
    fontFamily: '',
    headingFontFamily: '',
    borderRadius: 0,
    announcementEnabled: false,
    announcementText: '',
    announcementColor: '#ffffff',
    announcementBackground: '',
    stripeSecretKey: '',
    stripePublishableKey: '',
    stripeWebhookSecret: '',
    seoMetaTitle: '',
    seoMetaDescription: '',
    seoOgImageUrl: '',
    seoKeywords: '',
  };
}

@Component({
  selector: 'app-store-editor',
  imports: [FormsModule, RouterLink],
  templateUrl: './store-editor.html',
})
export class StoreEditor {
  private readonly storeService = inject(StoreService);
  private readonly storeContext = inject(StoreContextService);
  private readonly notifications = inject(NotificationService);

  readonly id = input<string>();
  protected readonly isNew = computed(() => !this.id());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly activeTab = signal<Tab>('general');
  protected readonly fontPresets = FONT_PRESETS;
  protected readonly templatePresets = TEMPLATE_PRESETS;

  /** Signal-based form — every field update goes through `patch()` so the
   *  computed `previewStyle` re-evaluates reactively. */
  protected readonly form = signal<StoreForm>(emptyForm());

  /** Update one or more form fields immutably. */
  protected patch(fields: Partial<StoreForm>): void {
    this.form.update((f) => ({ ...f, ...fields }));
  }

  /**
   * Switches template and, on request, adopts its colour/typography preset.
   * Picking a template alone never overwrites colours the store already set —
   * the layout changes, the brand stays.
   */
  protected applyTemplate(id: StoreTemplateId, withPreset = false): void {
    const template = TEMPLATE_PRESETS.find((t) => t.id === id);
    if (!template) return;
    this.patch(withPreset ? { templateId: id, ...template.preset } : { templateId: id });
  }

  /** The template the preview draws the *shape* of. */
  protected readonly activeTemplate = computed(
    () => TEMPLATE_PRESETS.find((t) => t.id === this.form().templateId) ?? TEMPLATE_PRESETS[0],
  );

  /** Column placeholders for the preview's product grid. */
  protected readonly previewCells = computed(() => this.cells(this.activeTemplate().layout.cols));

  /** `n` placeholder cells, for the picker's miniatures. */
  protected cells(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  /** Live preview CSS variables derived from the form signal. */
  protected readonly previewStyle = computed(() => {
    const f = this.form();
    const isDark = f.appearance === 'dark';
    const accent = f.accentColor || '#111111';
    const bg = isDark ? accent : this.lighten(accent, 0.97);
    const surface = isDark ? this.lighten(accent, 0.05) : this.lighten(accent, 0.99);
    const text = isDark ? '#f5f5f5' : this.darken(accent, 0.85);
    const border = isDark ? this.lighten(accent, 0.13) : this.lighten(accent, 0.88);
    const radius = f.borderRadius < 0 ? '9999px' : `${f.borderRadius}px`;
    const headingFont = f.headingFontFamily || f.fontFamily || 'inherit';
    return {
      '--pv-bg': bg,
      '--pv-surface': surface,
      '--pv-text': text,
      '--pv-border': border,
      '--pv-primary': f.primaryColor,
      '--pv-radius': radius,
      '--pv-font': f.fontFamily || 'inherit',
      '--pv-heading-font': headingFont,
    } as Record<string, string>;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) void this.load(id);
    });
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const s = await this.storeService.get(id);
      this.form.set({
        name: s.name,
        slug: s.slug,
        domain: s.domain ?? '',
        currency: s.currency,
        locale: s.locale,
        timezone: s.timezone,
        status: s.status,
        contactEmail: s.contactEmail ?? '',
        templateId: s.theme.templateId ?? 'bold',
        primaryColor: s.theme.primaryColor ?? '#6366f1',
        accentColor: s.theme.accentColor ?? '#111111',
        logoUrl: s.theme.logoUrl ?? '',
        faviconUrl: s.theme.faviconUrl ?? '',
        appearance: s.theme.appearance ?? 'dark',
        fontFamily: s.theme.fontFamily ?? '',
        headingFontFamily: s.theme.headingFontFamily ?? '',
        borderRadius: s.theme.borderRadius ?? 0,
        announcementEnabled: s.theme.announcement?.enabled ?? false,
        announcementText: s.theme.announcement?.text ?? '',
        announcementColor: s.theme.announcement?.color ?? '#ffffff',
        announcementBackground: s.theme.announcement?.background ?? '',
        stripeSecretKey: s.payment?.stripeSecretKey ?? '',
        stripePublishableKey: s.payment?.stripePublishableKey ?? '',
        stripeWebhookSecret: s.payment?.stripeWebhookSecret ?? '',
        seoMetaTitle: s.seo?.metaTitle ?? '',
        seoMetaDescription: s.seo?.metaDescription ?? '',
        seoOgImageUrl: s.seo?.ogImageUrl ?? '',
        seoKeywords: s.seo?.keywords?.join(', ') ?? '',
      });
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  protected async save(): Promise<void> {
    const f = this.form();
    if (!f.name.trim() || !f.slug.trim()) {
      this.notifications.error('Name and slug are required');
      this.activeTab.set('general');
      return;
    }
    this.saving.set(true);
    try {
      const dto = {
        name: f.name,
        slug: f.slug,
        domain: f.domain || undefined,
        currency: f.currency,
        locale: f.locale,
        timezone: f.timezone,
        status: f.status,
        contactEmail: f.contactEmail || undefined,
        theme: {
          templateId: f.templateId,
          primaryColor: f.primaryColor || undefined,
          accentColor: f.accentColor || undefined,
          logoUrl: f.logoUrl || undefined,
          faviconUrl: f.faviconUrl || undefined,
          appearance: f.appearance,
          fontFamily: f.fontFamily || undefined,
          headingFontFamily: f.headingFontFamily || undefined,
          borderRadius: f.borderRadius,
          announcement: {
            enabled: f.announcementEnabled,
            text: f.announcementText || undefined,
            color: f.announcementColor || undefined,
            background: f.announcementBackground || undefined,
          },
        },
        payment: {
          stripeSecretKey: f.stripeSecretKey || undefined,
          stripePublishableKey: f.stripePublishableKey || undefined,
          stripeWebhookSecret: f.stripeWebhookSecret || undefined,
        },
        seo: {
          metaTitle: f.seoMetaTitle || undefined,
          metaDescription: f.seoMetaDescription || undefined,
          ogImageUrl: f.seoOgImageUrl || undefined,
          keywords: f.seoKeywords ? f.seoKeywords.split(',').map((k) => k.trim()).filter(Boolean) : undefined,
        },
      };
      if (this.isNew()) {
        const created = await this.storeService.create(dto);
        this.notifications.success('Store created');
        await this.storeContext.refresh();
        this.storeContext.setStore(created._id);
      } else {
        await this.storeService.update(this.id()!, dto);
        this.notifications.success('Store saved');
        await this.storeContext.refresh();
      }
    } catch (err) {
      this.notifications.error(extractErrorMessage(err));
    } finally {
      this.saving.set(false);
    }
  }

  // --- Color helpers for the live preview ---
  private lighten(hex: string, amount: number): string {
    const [r, g, b] = this.hexToRgb(hex);
    const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return `#${[c(r + (255 - r) * amount), c(g + (255 - g) * amount), c(b + (255 - b) * amount)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }

  private darken(hex: string, amount: number): string {
    const [r, g, b] = this.hexToRgb(hex);
    const c = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return `#${[c(r * (1 - amount)), c(g * (1 - amount)), c(b * (1 - amount))].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
    const num = parseInt(full, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }
}
