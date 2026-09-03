import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/api/auth.service';
import { ToastService } from '../../core/toast.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="container-store flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div class="w-full max-w-sm">
        <p class="eyebrow text-center">{{ 'auth.signIn' | t }}</p>
        <h1 class="heading-lg mt-2 text-center">{{ 'auth.welcomeBack' | t }}</h1>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 flex flex-col gap-4">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-(--color-store-text-muted)">{{ 'auth.email' | t }}</span>
            <input type="email" formControlName="email" autocomplete="email" class="field-input" [class.!border-red-500]="invalid('email')" />
            @if (invalid('email')) {
              <span class="text-xs text-red-500">{{ 'auth.emailRequired' | t }}</span>
            }
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-(--color-store-text-muted)">{{ 'auth.password' | t }}</span>
            <input type="password" formControlName="password" autocomplete="current-password" class="field-input" [class.!border-red-500]="invalid('password')" />
            @if (invalid('password')) {
              <span class="text-xs text-red-500">{{ 'auth.passwordRequired' | t }}</span>
            }
          </label>

          <button type="submit" class="btn-primary mt-2" [disabled]="submitting()">
            {{ submitting() ? ('auth.signingIn' | t) : ('auth.signIn' | t) }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-(--color-store-text-muted)">
          {{ 'auth.noAccount' | t }}
          <a routerLink="/register" class="font-semibold text-(--color-store-primary) hover:underline">{{ 'auth.createAccount' | t }}</a>
        </p>
      </div>
    </div>
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected invalid(field: 'email' | 'password'): boolean {
    const c = this.form.controls[field];
    return c.invalid && (c.touched || c.dirty || this.form.touched);
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    try {
      const value = this.form.getRawValue();
      await this.auth.login(value.email, value.password);
      this.toast.success(this.auth.customer()?.firstName ? `Üdv újra, ${this.auth.customer()!.firstName}!` : 'Sikeres bejelentkezés');
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/account';
      void this.router.navigateByUrl(returnUrl);
    } catch {
      // errorInterceptor surfaces the message
    } finally {
      this.submitting.set(false);
    }
  }
}
