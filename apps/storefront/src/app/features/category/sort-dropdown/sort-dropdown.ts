import { Component, input, output } from '@angular/core';
import type { SortKey } from '../../../models/listing.model';

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Kiemelt' },
  { value: 'newest', label: 'Legújabb' },
  { value: 'price-asc', label: 'Ár szerint növekvő' },
  { value: 'price-desc', label: 'Ár szerint csökkenő' },
];

@Component({
  selector: 'app-sort-dropdown',
  template: `
    <label class="flex items-center gap-2 text-xs text-(--color-store-text-muted)">
      <span class="hidden sm:inline">Rendezés:</span>
      <select
        class="border border-(--color-store-border) bg-(--color-store-surface) px-2 py-1.5 text-xs text-(--color-store-text) outline-none"
        [value]="value()"
        (change)="onChange($event)"
        aria-label="Termékek rendezése"
      >
        @for (opt of options; track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
    </label>
  `,
})
export class SortDropdown {
  readonly value = input.required<SortKey>();
  readonly changed = output<SortKey>();
  protected readonly options = OPTIONS;

  protected onChange(event: Event): void {
    this.changed.emit((event.target as HTMLSelectElement).value as SortKey);
  }
}
