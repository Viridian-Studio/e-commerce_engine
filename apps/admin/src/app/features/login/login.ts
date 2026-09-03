import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { extractErrorMessage } from '../../core/http-error';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-(--color-bg) px-4">
      <div class="w-full max-w-sm">
        <div class="mb-8 flex flex-col items-center gap-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-(--color-brand) text-sm font-bold text-white">
            E
          </div>
          <h1 class="text-lg font-semibold text-(--color-text)">Engine Admin</h1>
          <p class="text-sm text-(--color-text-muted)">Sign in to manage your commerce engine</p>
        </div>

        <form class="card space-y-4 p-6" (submit)="submit($event)">
          <div>
            <label class="label" for="email">Email</label>
            <input
              id="email"
              type="email"
              class="input"
              name="email"
              autocomplete="username"
              [(ngModel)]="email"
              required
            />
          </div>
          <div>
            <label class="label" for="password">Password</label>
            <input
              id="password"
              type="password"
              class="input"
              name="password"
              autocomplete="current-password"
              [(ngModel)]="password"
              required
            />
          </div>

          @if (error()) {
            <p class="rounded-lg bg-(--color-danger-soft) px-3 py-2 text-sm text-(--color-danger)">
              {{ error() }}
            </p>
          }

          <button type="submit" class="btn-primary w-full" [disabled]="loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="mt-4 text-center text-xs text-(--color-text-faint)">
          Default seed login: admin&#64;ecommerce.engine / Admin123!
        </p>
      </div>
    </div>
  `,
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected email = '';
  protected password = '';
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.error.set('');
    this.loading.set(true);
    try {
      await this.auth.login(this.email, this.password);
      await this.router.navigateByUrl('/dashboard');
    } catch (err) {
      this.error.set(extractErrorMessage(err, 'Invalid email or password'));
    } finally {
      this.loading.set(false);
    }
  }
}
