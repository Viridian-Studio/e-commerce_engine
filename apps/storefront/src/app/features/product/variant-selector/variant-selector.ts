import { Component, computed, input, output } from '@angular/core';
import { TitleCasePipe, UpperCasePipe } from '@angular/common';
import type { ProductVariant } from '@ecom/types';

@Component({
  selector: 'app-variant-selector',
  imports: [TitleCasePipe, UpperCasePipe],
  template: `
    @if (colors().length > 0) {
      <div class="mb-5">
        <p class="field-label">Szín: <span class="text-(--color-store-text)">{{ selectedColor() | titlecase }}</span></p>
        <div class="flex flex-wrap gap-2.5">
          @for (color of colors(); track color) {
            <button
              type="button"
              class="h-8 w-8 rounded-full border-2 transition-transform disabled:cursor-not-allowed disabled:opacity-30"
              [style.background]="swatch(color)"
              [class]="selectedColor() === color ? 'scale-110 border-(--color-store-primary)' : 'border-white/25'"
              [disabled]="!colorAvailable(color)"
              [attr.aria-pressed]="selectedColor() === color"
              [attr.aria-label]="color"
              (click)="colorSelected.emit(color)"
            ></button>
          }
        </div>
      </div>
    }

    @if (sizes().length > 0) {
      <div class="mb-5">
        <div class="mb-2 flex items-center justify-between">
          <p class="field-label mb-0">Méret: <span class="text-(--color-store-text)">{{ selectedSize() | uppercase }}</span></p>
          <button type="button" class="text-xs text-(--color-store-text-muted) underline hover:text-(--color-store-text)">Méret táblázat</button>
        </div>
        <div class="flex flex-wrap gap-2">
          @for (size of sizes(); track size) {
            <button
              type="button"
              class="flex h-10 min-w-10 items-center justify-center border px-3 text-xs font-semibold uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              [class]="selectedSize() === size ? 'border-(--color-store-primary) bg-(--color-store-primary) text-white' : 'border-(--color-store-border) hover:border-(--color-store-text)'"
              [disabled]="!sizeAvailable(size)"
              [attr.aria-pressed]="selectedSize() === size"
              (click)="sizeSelected.emit(size)"
            >
              {{ size }}
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class VariantSelector {
  readonly variants = input.required<ProductVariant[]>();
  readonly selectedColor = input<string | null>(null);
  readonly selectedSize = input<string | null>(null);

  readonly colorSelected = output<string>();
  readonly sizeSelected = output<string>();

  protected readonly colors = computed(() => this.uniqueValues('color'));
  protected readonly sizes = computed(() => this.uniqueValues('size'));

  protected colorAvailable(color: string): boolean {
    const size = this.selectedSize();
    return this.variants().some(
      (v) =>
        v.stock > 0 &&
        v.attributes.some((a) => a.attributeSlug === 'color' && a.value === color) &&
        (!size || v.attributes.some((a) => a.attributeSlug === 'size' && a.value === size)),
    );
  }

  protected sizeAvailable(size: string): boolean {
    const color = this.selectedColor();
    return this.variants().some(
      (v) =>
        v.stock > 0 &&
        v.attributes.some((a) => a.attributeSlug === 'size' && a.value === size) &&
        (!color || v.attributes.some((a) => a.attributeSlug === 'color' && a.value === color)),
    );
  }

  private uniqueValues(slug: string): string[] {
    const values = this.variants().flatMap((v) => v.attributes.filter((a) => a.attributeSlug === slug).map((a) => a.value));
    return [...new Set(values)];
  }

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
}
