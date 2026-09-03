import { Injectable, signal } from '@angular/core';
import { Lang, TRANSLATIONS } from './translations';

const LANG_KEY = 'ecom_storefront_lang';
const SUPPORTED: Lang[] = ['hu', 'en'];

function readLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && SUPPORTED.includes(stored as Lang)) return stored as Lang;
  } catch {
    /* storage unavailable */
  }
  return 'hu';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(readLang());

  constructor() {
    document.documentElement.lang = this.lang();
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }

  t(key: string): string {
    return TRANSLATIONS[this.lang()][key] ?? TRANSLATIONS['en'][key] ?? key;
  }
}
