import { Injectable, computed, signal } from '@angular/core';
import type { StoreTemplateId } from '@ecom/types';
import { DEFAULT_TEMPLATE_ID, resolveTemplate, type TemplateDefinition, type TemplateLayout } from './templates';

/**
 * Holds the active storefront template (chosen per store in the admin).
 *
 * Styling travels through the `data-template` attribute this sets on
 * `<html>` — styles.css switches its CSS variables on it. Components only
 * read `layout()`, and only where the difference is structural (a different
 * header, hero, section order, page size) rather than cosmetic.
 *
 * Applied from ThemeService inside the app initializer, so the attribute is
 * on the document before the first render — no flash of the wrong template.
 */
@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly active = signal<TemplateDefinition>(resolveTemplate(DEFAULT_TEMPLATE_ID));

  readonly template = this.active.asReadonly();
  readonly layout = computed<TemplateLayout>(() => this.active().layout);

  apply(id: StoreTemplateId | undefined): void {
    const definition = resolveTemplate(id);
    this.active.set(definition);
    document.documentElement.dataset['template'] = definition.id;
  }
}
