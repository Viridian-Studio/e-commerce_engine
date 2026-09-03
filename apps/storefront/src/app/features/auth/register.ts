import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/api/auth.service';
import { ToastService } from '../../core/toast.service';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="container-store flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div class="w-full max-w-sm">
        <p class="eyebrow text-center">{{ 'auth.createAccount' | t }}</p>
        <h1 class="heading-lg mt-2 text-center">{{ 'auth.join' | t }}</h1>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-8 flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-semibold uppercase tracking-wide text-(--color-store-text-muted)">{{ 'auth.firstName' | t }}</span>
              <input type="text" formControlName="firstName" autocomplete="given-name" class="field-input" [class.!border-red-500]="invalid('firstName')" />
              @if (invalid('firstName')) {
                <span class="text-xs text-red-500">{{ 'auth.required' | t }}</span>
              }
            </label>
            <label class="flex flex-col gap-1.5">
              <span class="text-xs font-semibold uppercase tracking-wide text-(--color-store-text-muted)">{{ 'auth.lastName' | t }}</span>
              <input type="text" formControlName="lastName" autocomplete="family-name" class="field-input" [class.!border-red-500]="invalid('lastName')" />
              @if (invalid('lastName')) {
                <span class="text-xs text-red-500">{{ 'auth.required' | t }}</span>
              }
            </label>
          </div>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-(--color-store-text-muted)">{{ 'auth.email' | t }}</span>
            <input type="email" formControlName="email" autocomplete="email" class="field-input" [class.!border-red-500]="invalid('email')" />
            @if (invalid('email')) {
              <span class="text-xs text-red-500">{{ 'auth.emailRequired' | t }}</span>
            }
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-(--color-store-text-muted)">{{ 'auth.phone' | t }}</span>
            <input type="tel" formControlName="phone" autocomplete="tel" class="field-input" />
          </label>

          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold uppercase tracking-wide text-(--color-store-text-muted)">{{ 'auth.password' | t }}</span>
            <input type="password" formControlName="password" autocomplete="new-password" class="field-input" [class.!border-red-500]="invalid('password')" />
            @if (invalid('password')) {
              <span class="text-xs text-red-500">{{ 'auth.passwordMin' | t }}</span>
            }
          </label>

          <button type="submit" class="btn-primary mt-2" [disabled]="submitting()">
            {{ submitting() ? ('auth.creating' | t) : ('auth.createAccount' | t) }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-(--color-store-text-muted)">
          {{ 'auth.haveAccount' | t }}
          <a routerLink="/login" class="font-semibold text-(--color-store-primary) hover:underline">{{ 'auth.signIn' | t }}</a>
        </p>
      </div>
    </div>
  `,
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected invalid(field: keyof typeof this.form.controls): boolean {
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
      await this.auth.register({
        email: value.email,
        password: value.password,
        firstName: value.firstName,
        lastName: value.lastName,
        phone: value.phone || undefined,
      });
      this.toast.success(`Üdvözlünk, ${this.auth.customer()?.firstName}!`);
      void this.router.navigateByUrl('/account');
    } catch {
      // errorInterceptor surfaces the message
    } finally {
      this.submitting.set(false);
    }
  }
}
