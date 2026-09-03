import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  template: `
    <nav class="flex flex-wrap items-center gap-1.5 text-xs text-(--color-store-text-muted)" aria-label="Breadcrumb">
      @for (item of items(); track item.label; let last = $last) {
        @if (item.url && !last) {
          <a [routerLink]="item.url" class="hover:text-(--color-store-text)">{{ item.label }}</a>
        } @else {
          <span class="text-(--color-store-text)">{{ item.label }}</span>
        }
        @if (!last) {
          <span aria-hidden="true">/</span>
        }
      }
    </nav>
  `,
})
export class Breadcrumb {
  readonly items = input.required<BreadcrumbItem[]>();
}
