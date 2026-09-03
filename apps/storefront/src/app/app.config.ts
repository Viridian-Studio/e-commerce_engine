import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { storeHeaderInterceptor } from './core/interceptors/store-header.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { StoreService } from './core/api/store.service';
import { CartService } from './core/api/cart.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([storeHeaderInterceptor, errorInterceptor])),
    provideAppInitializer(() => {
      const store = inject(StoreService);
      const cart = inject(CartService);
      return store.load().then(() => cart.init());
    }),
  ],
};
