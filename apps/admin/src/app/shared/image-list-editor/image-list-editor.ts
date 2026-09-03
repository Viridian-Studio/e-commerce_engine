import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ImageRef } from '@ecom/types';

/**
 * URL-based stand-in for a real asset uploader: the engine has no file
 * storage service yet, so images are referenced by URL. Supports adding,
 * reordering and removing — the same interactions a real uploader would need.
 */
@Component({
  selector: 'app-image-list-editor',
  imports: [FormsModule],
  template: `
    <div class="space-y-2">
      @for (img of images(); track $index) {
        <div class="flex items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface-2) p-2">
          @if (img.url) {
            <img [src]="img.url" alt="" class="h-10 w-10 shrink-0 rounded object-cover" />
          } @else {
            <div class="h-10 w-10 shrink-0 rounded bg-(--color-surface-3)"></div>
          }
          <input
            type="text"
            class="input flex-1"
            placeholder="https://…"
            [ngModel]="img.url"
            (ngModelChange)="updateUrl($index, $event)"
          />
          <div class="flex shrink-0 items-center gap-0.5">
            <button type="button" class="icon-btn" [disabled]="$index === 0" (click)="move($index, -1)" aria-label="Move up">
              <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m18 15-6-6-6 6" />
              </svg>
            </button>
            <button
              type="button"
              class="icon-btn"
              [disabled]="$index === images().length - 1"
              (click)="move($index, 1)"
              aria-label="Move down"
            >
              <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <button type="button" class="icon-btn hover:text-(--color-danger)" (click)="remove($index)" aria-label="Remove">
              <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
                <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        </div>
      }
      <button type="button" class="btn-secondary w-full" (click)="add()">
        <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
          <path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 5v14M5 12h14" />
        </svg>
        Add image URL
      </button>
    </div>
  `,
})
export class ImageListEditor {
  readonly images = input<ImageRef[]>([]);
  readonly imagesChange = output<ImageRef[]>();

  protected add(): void {
    this.emit([...this.images(), { url: '', position: this.images().length }]);
  }

  protected updateUrl(index: number, url: string): void {
    this.emit(this.images().map((img, i) => (i === index ? { ...img, url } : img)));
  }

  protected remove(index: number): void {
    this.emit(this.images().filter((_, i) => i !== index));
  }

  protected move(index: number, delta: number): void {
    const list = [...this.images()];
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    this.emit(list);
  }

  private emit(list: ImageRef[]): void {
    this.imagesChange.emit(list.map((img, i) => ({ ...img, position: i })));
  }
}
