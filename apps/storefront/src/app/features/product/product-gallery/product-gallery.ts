import { Component, computed, effect, input, signal } from '@angular/core';
import type { ImageRef } from '@ecom/types';

@Component({
  selector: 'app-product-gallery',
  template: `
    <div class="flex flex-col-reverse gap-3 sm:flex-row">
      @if (images().length > 1) {
        <div class="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible">
          @for (img of images(); track img.url; let i = $index) {
            <button
              type="button"
              class="aspect-[4/5] w-16 shrink-0 overflow-hidden bg-(--color-store-light) ring-2 sm:w-full"
              [class]="i === activeIndex() ? 'ring-(--color-store-primary)' : 'ring-transparent'"
              (click)="activeIndex.set(i)"
              [attr.aria-label]="'Show image ' + (i + 1)"
              [attr.aria-current]="i === activeIndex()"
            >
              <img [src]="img.url" [alt]="img.alt || ''" class="h-full w-full object-cover" />
            </button>
          }
        </div>
      }
      <div class="aspect-[4/5] flex-1 overflow-hidden bg-(--color-store-light)">
        @if (active(); as img) {
          <img [src]="img.url" [alt]="img.alt || ''" class="h-full w-full object-cover" />
        }
      </div>
    </div>
  `,
})
export class ProductGallery {
  readonly images = input.required<ImageRef[]>();
  protected readonly activeIndex = signal(0);
  protected readonly active = computed(() => this.images()[this.activeIndex()] ?? this.images()[0]);

  constructor() {
    effect(() => {
      this.images();
      this.activeIndex.set(0);
    });
  }
}
