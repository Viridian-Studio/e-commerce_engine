import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-section-heading',
  imports: [RouterLink],
  template: `
    <div class="mb-8 flex items-end justify-between gap-4">
      <h2 class="heading-lg">{{ title() }}</h2>
      @if (linkUrl()) {
        <a [routerLink]="linkUrl()" class="group flex shrink-0 items-center gap-1.5 text-xs font-semibold tracking-wide uppercase hover:text-(--color-store-primary)">
          {{ linkLabel() }}
          <span class="transition-transform group-hover:translate-x-0.5" aria-hidden="true">&rarr;</span>
        </a>
      }
    </div>
  `,
})
export class SectionHeading {
  readonly title = input.required<string>();
  readonly linkUrl = input<string>();
  readonly linkLabel = input('Összes megtekintése');
}
