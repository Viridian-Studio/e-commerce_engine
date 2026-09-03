import { Component, inject } from '@angular/core';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { Lang } from '../../../core/i18n/translations';

@Component({
  selector: 'app-language-switcher',
  template: `
    <div class="flex items-center gap-0.5 text-[11px] font-semibold tracking-wide">
      @for (l of langs; track l) {
        <button
          type="button"
          class="px-1 uppercase transition-colors"
          [class]="i18n.lang() === l ? 'text-(--color-store-text)' : 'text-(--color-store-text-faint) hover:text-(--color-store-text-muted)'"
          (click)="i18n.setLang(l)"
        >
          {{ l }}
        </button>
      }
    </div>
  `,
})
export class LanguageSwitcher {
  protected readonly i18n = inject(I18nService);
  protected readonly langs: Lang[] = ['hu', 'en'];
}
