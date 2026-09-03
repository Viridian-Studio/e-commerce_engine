import { Component, input, signal } from '@angular/core';

type TabKey = 'description' | 'fit' | 'shipping';

const SIZE_FIT_COPY = [
  'Valós méretezés — a vásárlók többsége a megszokott méretét rendeli.',
  'Kényelmes, mindennapi szabás, rétegezéshez is ideális.',
  'A modell 182 cm magas, M méretet visel.',
];

const SHIPPING_COPY = [
  'A rendelések 1-2 munkanapon belül kerülnek feladásra.',
  'Ingyenes visszaküldés a kézbesítéstől számított 14 napon belül.',
  'Nemzetközi szállítás elérhető a pénztárnál.',
];

@Component({
  selector: 'app-product-tabs',
  template: `
    <div class="border-b border-(--color-store-border)">
      <div class="flex gap-6 text-xs font-semibold tracking-wide uppercase">
        @for (tab of tabs; track tab.key) {
          <button
            type="button"
            class="border-b-2 py-3 transition-colors"
            [class]="active() === tab.key ? 'border-(--color-store-primary) text-(--color-store-text)' : 'border-transparent text-(--color-store-text-muted) hover:text-(--color-store-text)'"
            (click)="active.set(tab.key)"
          >
            {{ tab.label }}
          </button>
        }
      </div>
    </div>

    <div class="py-6 text-sm text-(--color-store-text-muted)">
      @switch (active()) {
        @case ('description') {
          <p class="whitespace-pre-line">{{ description() || 'Ehhez a termékhez még nincs leírás.' }}</p>
        }
        @case ('fit') {
          <ul class="flex list-disc flex-col gap-2 pl-4">
            @for (line of sizeFitCopy; track line) {
              <li>{{ line }}</li>
            }
          </ul>
        }
        @case ('shipping') {
          <ul class="flex list-disc flex-col gap-2 pl-4">
            @for (line of shippingCopy; track line) {
              <li>{{ line }}</li>
            }
          </ul>
        }
      }
    </div>
  `,
})
export class ProductTabs {
  readonly description = input<string>('');
  protected readonly active = signal<TabKey>('description');
  protected readonly sizeFitCopy = SIZE_FIT_COPY;
  protected readonly shippingCopy = SHIPPING_COPY;
  protected readonly tabs: { key: TabKey; label: string }[] = [
    { key: 'description', label: 'Leírás' },
    { key: 'fit', label: 'Méret és szabás' },
    { key: 'shipping', label: 'Szállítás és visszaküldés' },
  ];
}
