import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z' },
  { label: 'Products', path: '/products', icon: 'M20 7 12 3 4 7m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { label: 'Inventory', path: '/inventory', icon: 'M3 7h18M3 12h18M3 17h12' },
  { label: 'Orders', path: '/orders', icon: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Zm0 0h12M3 6h18M9 10a3 3 0 0 0 6 0' },
  { label: 'Customers', path: '/customers', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm11 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
  { label: 'Categories', path: '/categories', icon: 'M3 4h7v7H3V4Zm0 9h7v7H3v-7Zm9-9h9M12 8h9M12 17h9' },
  { label: 'Collections', path: '/collections', icon: 'M2 8h20M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8M10 12h4M2 4l1-2h18l1 2' },
  { label: 'Brands', path: '/brands', icon: 'M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7l-9-5Z' },
  { label: 'Discounts', path: '/discounts', icon: 'M20 12 12 4 4 12v8h16v-8ZM9 15h.01M15 9l-6 6' },
  { label: 'Shipping', path: '/shipping', icon: 'M3 7h11v8H3zm11 3h4l3 3v2h-7zM6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm12 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z' },
  { label: 'Content', path: '/content', icon: 'M4 5h16v3H4V5Zm0 5h16v9H4v-9Zm3 2.5h10' },
  { label: 'Stores', path: '/stores', icon: 'M3 9.5 4.5 4h15L21 9.5M3 9.5v9a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-9M3 9.5h18M9 19.5v-5h6v5' },
  { label: 'Settings', path: '/settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.15-1.53l2-1.56-2-3.46-2.36.95a8 8 0 0 0-2.65-1.53L14.4 2h-4.8l-.44 2.87a8 8 0 0 0-2.65 1.53l-2.36-.95-2 3.46 2 1.56A8 8 0 0 0 4 12a8 8 0 0 0 .15 1.53l-2 1.56 2 3.46 2.36-.95a8 8 0 0 0 2.65 1.53L9.6 22h4.8l.44-2.87a8 8 0 0 0 2.65-1.53l2.36.95 2-3.46-2-1.56A8 8 0 0 0 20 12Z' },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside
      class="flex h-full shrink-0 flex-col border-r border-(--color-border) bg-(--color-surface) transition-[width]"
      [style.width]="collapsed() ? '4.25rem' : '15.5rem'"
    >
      <div class="flex h-14 items-center gap-2 border-b border-(--color-border) px-4">
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-(--color-brand) text-xs font-bold text-white"
        >
          E
        </div>
        @if (!collapsed()) {
          <span class="truncate text-sm font-semibold text-(--color-text)">Viridian Commerce</span>
        }
      </div>

      <nav class="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
        @for (item of items; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-(--color-surface-3) text-(--color-text)"
            [routerLinkActiveOptions]="{ exact: false }"
            class="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-(--color-text-muted) transition-all hover:bg-(--color-surface-2) hover:text-(--color-text) active:scale-[0.98]"
            [title]="item.label"
          >
            <svg viewBox="0 0 24 24" fill="none" class="h-[18px] w-[18px] shrink-0">
              <path
                [attr.d]="item.icon"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            @if (!collapsed()) {
              <span class="truncate">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <button
        type="button"
        class="flex items-center justify-center gap-2 border-t border-(--color-border) py-3 text-(--color-text-faint) hover:text-(--color-text)"
        (click)="toggle.emit()"
      >
        <svg viewBox="0 0 24 24" fill="none" class="h-4 w-4" [class.rotate-180]="collapsed()">
          <path
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 6l-6 6 6 6"
          />
        </svg>
      </button>
    </aside>
  `,
})
export class Sidebar {
  readonly collapsed = input(false);
  readonly toggle = output<void>();
  protected readonly items = NAV_ITEMS;
}
