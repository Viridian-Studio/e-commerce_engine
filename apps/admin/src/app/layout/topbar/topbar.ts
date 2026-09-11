import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { StoreContextService } from '../../core/store-context.service';

@Component({
  selector: 'app-topbar',
  imports: [FormsModule, RouterLink],
  template: `
    <header
      class="flex h-14 shrink-0 items-center gap-3 border-b border-(--color-border) bg-(--color-surface) px-4"
    >
      <!-- Store selector -->
      <div class="relative">
        <select
          class="input w-48 appearance-none py-1.5 pr-8 text-sm"
          [ngModel]="storeContext.currentStoreId()"
          (ngModelChange)="storeContext.setStore($event)"
        >
          @if (storeContext.stores().length === 0) {
            <option value="">No stores yet</option>
          }
          @for (store of storeContext.stores(); track store._id) {
            <option [value]="store._id">{{ store.name }}</option>
          }
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          class="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-(--color-text-faint)"
        >
          <path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </div>

      <!-- Search (visual only — no global search endpoint yet) -->
      <div class="relative hidden max-w-sm flex-1 sm:block">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-(--color-text-faint)"
        >
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
          <path d="m20 20-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input type="search" placeholder="Search…" class="input py-1.5 pl-9 text-sm" />
      </div>

      <div class="flex-1"></div>

      <!-- Notifications -->
      <div class="relative">
        <button type="button" class="icon-btn" (click)="notifOpen.set(!notifOpen())" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" class="h-[18px] w-[18px]">
            <path
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9Zm4.5 12a1.5 1.5 0 0 0 3 0"
            />
          </svg>
        </button>
        @if (notifOpen()) {
          <div class="card absolute top-10 right-0 z-50 w-64 p-3 text-sm shadow-xl">
            <p class="font-medium text-(--color-text)">Notifications</p>
            <p class="mt-2 text-(--color-text-muted)">You're all caught up.</p>
          </div>
        }
      </div>

      <!-- User menu -->
      <div class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg py-1 pr-1 pl-1 hover:bg-(--color-surface-2)"
          (click)="userOpen.set(!userOpen())"
        >
          <div
            class="flex h-7 w-7 items-center justify-center rounded-full bg-(--color-brand-soft) text-xs font-semibold text-(--color-brand)"
          >
            {{ initials() }}
          </div>
        </button>
        @if (userOpen()) {
          <div class="card absolute top-10 right-0 z-50 w-56 p-1.5 text-sm shadow-xl">
            <div class="px-2.5 py-2">
              <p class="truncate font-medium text-(--color-text)">{{ auth.user()?.name }}</p>
              <p class="truncate text-xs text-(--color-text-muted)">{{ auth.user()?.email }}</p>
            </div>
            <div class="my-1 border-t border-(--color-border)"></div>
            <a
              routerLink="/settings"
              class="block rounded-md px-2.5 py-1.5 text-(--color-text-muted) hover:bg-(--color-surface-2) hover:text-(--color-text)"
              (click)="userOpen.set(false)"
              >Settings</a
            >
            <button
              type="button"
              class="block w-full rounded-md px-2.5 py-1.5 text-left text-(--color-danger) hover:bg-(--color-danger-soft)"
              (click)="logout()"
            >
              Log out
            </button>
          </div>
        }
      </div>
    </header>
  `,
})
export class Topbar {
  protected readonly auth = inject(AuthService);
  protected readonly storeContext = inject(StoreContextService);
  private readonly router = inject(Router);

  protected readonly notifOpen = signal(false);
  protected readonly userOpen = signal(false);

  protected initials(): string {
    const name = this.auth.user()?.name ?? '?';
    return name
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  protected logout(): void {
    this.userOpen.set(false);
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
