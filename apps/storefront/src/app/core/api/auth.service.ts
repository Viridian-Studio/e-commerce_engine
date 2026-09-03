import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { STOREFRONT_CONFIG } from '../config/storefront.config';
import { SKIP_ERROR_TOAST } from '../http-context';
import type { CustomerAuthUser, CustomerAuthResponse, CustomerRegisterRequest } from '@ecom/types';

const TOKEN_KEY = 'ecom_storefront_customer_token';

/**
 * Storefront customer auth. Mirrors the cart service's pattern: a single
 * signal source of truth (`customer`) backed by a localStorage token. Every
 * login/register round-trips through the engine's `/storefront/auth/*`
 * endpoints; `me` is called once on startup to restore a saved session.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly base = `${STOREFRONT_CONFIG.apiBase}/auth`;

  readonly customer = signal<CustomerAuthUser | null>(null);
  readonly loading = signal(false);

  private get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private set token(value: string | null) {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  }

  /** True when a customer JWT is present (not necessarily validated yet). */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  /** Restores the session from a saved token — call once on app startup. */
  async init(): Promise<void> {
    const token = this.token;
    if (!token) return;
    this.loading.set(true);
    try {
      const customer = await firstValueFrom(
        this.http.get<CustomerAuthUser>(`${this.base}/me`, {
          context: new HttpContext().set(SKIP_ERROR_TOAST, true),
        }),
      );
      this.customer.set(customer);
    } catch {
      // Token expired / revoked — drop it silently.
      this.token = null;
    } finally {
      this.loading.set(false);
    }
  }

  async login(email: string, password: string): Promise<CustomerAuthUser> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.post<CustomerAuthResponse>(`${this.base}/login`, { email, password }),
      );
      return this.apply(res);
    } finally {
      this.loading.set(false);
    }
  }

  async register(dto: CustomerRegisterRequest): Promise<CustomerAuthUser> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(this.http.post<CustomerAuthResponse>(`${this.base}/register`, dto));
      return this.apply(res);
    } finally {
      this.loading.set(false);
    }
  }

  logout(): void {
    this.token = null;
    this.customer.set(null);
  }

  private apply(res: CustomerAuthResponse): CustomerAuthUser {
    this.token = res.accessToken;
    this.customer.set(res.customer);
    return res.customer;
  }
}
