import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CategoryNode } from '../../core/api/category.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-mobile-menu',
  imports: [RouterLink, TranslatePipe],
  template: `
    <div
      class="fixed inset-0 z-50 lg:hidden"
      [class]="open() ? '' : 'pointer-events-none'"
      [attr.aria-hidden]="!open()"
    >
      <div
        class="absolute inset-0 bg-black/60 transition-opacity duration-300"
        [class]="open() ? 'opacity-100' : 'opacity-0'"
        (click)="closed.emit()"
      ></div>
      <nav
        class="section-dark absolute inset-y-0 left-0 flex w-[85vw] max-w-xs flex-col overflow-y-auto border-r border-(--color-store-border) p-6 transition-transform duration-300 ease-out"
        [class]="open() ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="mb-6 flex items-center justify-between">
          <span class="text-xs font-semibold tracking-wide uppercase text-(--color-store-text-muted)">{{ 'nav.menu' | t }}</span>
          <button type="button" class="icon-btn" (click)="closed.emit()" [attr.aria-label]="'nav.menu' | t">&times;</button>
        </div>

        <a routerLink="/" (click)="closed.emit()" class="py-2.5 text-sm font-semibold uppercase">{{ 'nav.home' | t }}</a>

        @for (top of categoryTree(); track top._id) {
          <div class="border-t border-(--color-store-border) py-2.5">
            @if (top.children.length > 0) {
              <p class="text-sm font-semibold uppercase">{{ top.name }}</p>
              <div class="mt-2 flex flex-col gap-2 pl-2">
                @for (child of top.children; track child._id) {
                  <a [routerLink]="['/category', child.slug]" (click)="closed.emit()" class="text-sm text-(--color-store-text-muted)">
                    {{ child.name }}
                  </a>
                }
              </div>
            } @else {
              <a [routerLink]="['/category', top.slug]" (click)="closed.emit()" class="text-sm font-semibold uppercase">{{ top.name }}</a>
            }
          </div>
        }

        <a routerLink="/brands" (click)="closed.emit()" class="border-t border-(--color-store-border) py-2.5 text-sm font-semibold uppercase">{{ 'nav.brands' | t }}</a>
        <a [routerLink]="['/collection', 'sale']" (click)="closed.emit()" class="border-t border-(--color-store-border) py-2.5 text-sm font-semibold text-(--color-store-primary) uppercase">{{ 'nav.sale' | t }}</a>
        <a [routerLink]="['/collection', 'new-arrivals']" (click)="closed.emit()" class="border-t border-b border-(--color-store-border) py-2.5 text-sm font-semibold uppercase">{{ 'nav.newArrivals' | t }}</a>

        <div class="mt-6 flex flex-col gap-2">
          <a routerLink="/login" (click)="closed.emit()" class="text-sm text-(--color-store-text-muted)">{{ 'nav.account' | t }}</a>
          <a routerLink="/wishlist" (click)="closed.emit()" class="text-sm text-(--color-store-text-muted)">{{ 'nav.wishlist' | t }}</a>
        </div>
      </nav>
    </div>
  `,
})
export class MobileMenu {
  readonly categoryTree = input.required<CategoryNode[]>();
  readonly open = input.required<boolean>();
  readonly closed = output<void>();
}
