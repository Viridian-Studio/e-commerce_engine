import { Routes } from '@angular/router';
import { StorefrontLayout } from './layout/storefront-layout/storefront-layout';

export const routes: Routes = [
  {
    path: '',
    component: StorefrontLayout,
    children: [
      { path: '', loadComponent: () => import('./features/home/home').then((m) => m.Home) },
      {
        path: 'category/:slug',
        loadComponent: () => import('./features/category/category').then((m) => m.CategoryPage),
        data: { mode: 'category' },
      },
      {
        path: 'collection/:slug',
        loadComponent: () => import('./features/category/category').then((m) => m.CategoryPage),
        data: { mode: 'collection' },
      },
      {
        path: 'brand/:slug',
        loadComponent: () => import('./features/category/category').then((m) => m.CategoryPage),
        data: { mode: 'brand' },
      },
      {
        path: 'brands',
        loadComponent: () => import('./features/brands/brands').then((m) => m.BrandsPage),
      },
      {
        path: 'product/:slug',
        loadComponent: () => import('./features/product/product').then((m) => m.ProductPage),
      },
      { path: 'cart', loadComponent: () => import('./features/cart/cart').then((m) => m.CartPage) },
      {
        path: 'checkout',
        loadComponent: () => import('./features/checkout/checkout').then((m) => m.CheckoutPage),
      },
      {
        path: 'checkout/confirmation/:number',
        loadComponent: () =>
          import('./features/checkout/confirmation/confirmation').then((m) => m.OrderConfirmation),
      },
      {
        path: 'search',
        loadComponent: () => import('./shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
        data: { title: 'Keresés', message: 'A termékkeresés a következő frissítésben érkezik.' },
      },
      {
        path: 'login',
        loadComponent: () => import('./shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
        data: { title: 'Fiók', message: 'A vásárlói fiókok a következő frissítésben érkeznek.' },
      },
      {
        path: 'wishlist',
        loadComponent: () => import('./shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
        data: { title: 'Kedvencek', message: 'A teljes kedvenclista a következő frissítésben érkezik.' },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
