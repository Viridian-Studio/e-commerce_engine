import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { FacetOption, SiblingLink } from '../../../models/listing.model';

@Component({
  selector: 'app-filter-panel',
  imports: [RouterLink],
  template: `
    <div class="flex flex-col gap-8">
      @if (siblings().length > 0) {
        <div>
          <h3 class="heading-md mb-3 text-sm">{{ siblingsTitle() }}</h3>
          <ul class="flex flex-col gap-2 text-sm">
            @for (s of siblings(); track s.slug) {
              <li>
                <a
                  [routerLink]="['/category', s.slug]"
                  class="transition-colors"
                  [class]="s.active ? 'text-(--color-store-primary)' : 'text-(--color-store-text-muted) hover:text-(--color-store-text)'"
                >
                  {{ s.name }}
                </a>
              </li>
            }
          </ul>
        </div>
      }

      @if (sizes().length > 0) {
        <div>
          <h3 class="heading-md mb-3 text-sm">Méret</h3>
          <ul class="flex flex-col gap-2.5 text-sm">
            @for (size of sizes(); track size.value) {
              <li>
                <label class="flex cursor-pointer items-center gap-2.5">
                  <input
                    type="checkbox"
                    class="h-3.5 w-3.5 accent-(--color-store-primary)"
                    [checked]="selectedSizes().includes(size.value)"
                    (change)="sizeToggled.emit(size.value)"
                  />
                  <span class="text-(--color-store-text-muted)">{{ size.label }} ({{ size.count }})</span>
                </label>
              </li>
            }
          </ul>
        </div>
      }

      @if (colors().length > 0) {
        <div>
          <h3 class="heading-md mb-3 text-sm">Szín</h3>
          <div class="flex flex-wrap gap-2">
            @for (color of colors(); track color.value) {
              <button
                type="button"
                class="h-6 w-6 rounded-full border-2 transition-transform"
                [style.background]="swatch(color.value)"
                [class]="selectedColors().includes(color.value) ? 'scale-110 border-(--color-store-primary)' : 'border-white/20'"
                [attr.aria-pressed]="selectedColors().includes(color.value)"
                [attr.aria-label]="color.label"
                (click)="colorToggled.emit(color.value)"
              ></button>
            }
          </div>
        </div>
      }

      @if (priceCeiling() > 0) {
        <div>
          <h3 class="heading-md mb-3 text-sm">Ár</h3>
          <input
            type="range"
            class="w-full accent-(--color-store-primary)"
            [min]="0"
            [max]="priceCeiling()"
            [value]="maxPrice() ?? priceCeiling()"
            (input)="onPriceInput($event)"
          />
          <div class="mt-1 flex justify-between text-xs text-(--color-store-text-muted)">
            <span>€0</span>
            <span>€{{ maxPrice() ?? priceCeiling() }}{{ (maxPrice() ?? priceCeiling()) >= priceCeiling() ? '+' : '' }}</span>
          </div>
        </div>
      }

      <button type="button" class="btn-outline" (click)="cleared.emit()">Szűrők törlése</button>
    </div>
  `,
})
export class FilterPanel {
  readonly siblingsTitle = input('Kategóriák');
  readonly siblings = input<SiblingLink[]>([]);
  readonly sizes = input<FacetOption[]>([]);
  readonly colors = input<FacetOption[]>([]);
  readonly selectedSizes = input<string[]>([]);
  readonly selectedColors = input<string[]>([]);
  readonly maxPrice = input<number | null>(null);
  readonly priceCeiling = input(0);

  readonly sizeToggled = output<string>();
  readonly colorToggled = output<string>();
  readonly maxPriceChanged = output<number>();
  readonly cleared = output<void>();

  protected swatch(color: string): string {
    const known: Record<string, string> = {
      black: '#111111',
      white: '#f5f5f5',
      red: '#e2141f',
      grey: '#8a8a8f',
      gray: '#8a8a8f',
      blue: '#2b4bff',
      yellow: '#f5c518',
    };
    return known[color.toLowerCase()] ?? color;
  }

  protected onPriceInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.maxPriceChanged.emit(value);
  }
}
