import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { storeHeaderInterceptor } from './core/interceptors/store-header.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { StoreService } from './core/api/store.service';
import { CartService } from './core/api/cart.service';
import { ThemeService } from './core/theme/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([storeHeaderInterceptor, errorInterceptor])),
    provideAppInitializer(() => {
      const store = inject(StoreService);
      const cart = inject(CartService);
      const theme = inject(ThemeService);
      return store.load().then(() => {
        theme.apply(store.store()?.theme);
        return cart.init();
      });
    }),
  ],
};
