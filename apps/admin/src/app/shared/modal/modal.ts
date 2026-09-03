import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60" (click)="close.emit()"></div>
        <div
          class="card relative flex max-h-[90vh] w-full flex-col shadow-2xl"
          [style.max-width]="maxWidth()"
        >
          <div class="flex items-center justify-between border-b border-(--color-border) px-5 py-4">
            <h2 class="text-sm font-semibold text-(--color-text)">{{ title() }}</h2>
            <button type="button" class="icon-btn" (click)="close.emit()" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4">
                <path
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  d="M6 6l12 12M18 6 6 18"
                />
              </svg>
            </button>
          </div>
          <div class="overflow-y-auto px-5 py-4">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
})
export class Modal {
  readonly open = input(false);
  readonly title = input('');
  readonly maxWidth = input('32rem');
  readonly close = output<void>();
}
