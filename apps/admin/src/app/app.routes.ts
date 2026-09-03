import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { AdminLayout } from './layout/admin-layout/admin-layout';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/login/login').then((m) => m.Login) },
  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },

      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/product-list/product-list').then((m) => m.ProductList),
      },
      {
        path: 'products/new',
        loadComponent: () =>
          import('./features/products/product-editor/product-editor').then((m) => m.ProductEditor),
      },
      {
        path: 'products/:id',
        data: { mode: 'view' },
        loadComponent: () =>
          import('./features/products/product-editor/product-editor').then((m) => m.ProductEditor),
      },
      {
        path: 'products/:id/edit',
        data: { mode: 'edit' },
        loadComponent: () =>
          import('./features/products/product-editor/product-editor').then((m) => m.ProductEditor),
      },

      {
        path: 'inventory',
        loadComponent: () =>
          import('./features/inventory/inventory-list').then((m) => m.InventoryList),
      },

      {
        path: 'categories',
        loadComponent: () =>
          import('./features/categories/category-list/category-list').then((m) => m.CategoryList),
      },
      {
        path: 'categories/new',
        loadComponent: () =>
          import('./features/categories/category-editor/category-editor').then(
            (m) => m.CategoryEditor,
          ),
      },
      {
        path: 'categories/:id/edit',
        loadComponent: () =>
          import('./features/categories/category-editor/category-editor').then(
            (m) => m.CategoryEditor,
          ),
      },

      {
        path: 'brands',
        loadComponent: () => import('./features/brands/brand-list/brand-list').then((m) => m.BrandList),
      },
      {
        path: 'brands/new',
        loadComponent: () =>
          import('./features/brands/brand-editor/brand-editor').then((m) => m.BrandEditor),
      },
      {
        path: 'brands/:id/edit',
        loadComponent: () =>
          import('./features/brands/brand-editor/brand-editor').then((m) => m.BrandEditor),
      },

      {
        path: 'collections',
        loadComponent: () =>
          import('./features/collections/collection-list/collection-list').then(
            (m) => m.CollectionList,
          ),
      },
      {
        path: 'collections/new',
        loadComponent: () =>
          import('./features/collections/collection-editor/collection-editor').then(
            (m) => m.CollectionEditor,
          ),
      },
      {
        path: 'collections/:id/edit',
        loadComponent: () =>
          import('./features/collections/collection-editor/collection-editor').then(
            (m) => m.CollectionEditor,
          ),
      },

      {
        path: 'orders',
        loadComponent: () => import('./features/orders/order-list/order-list').then((m) => m.OrderList),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/orders/order-detail/order-detail').then((m) => m.OrderDetail),
      },

      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customer-list/customer-list').then((m) => m.CustomerList),
      },
      {
        path: 'customers/:id',
        loadComponent: () =>
          import('./features/customers/customer-detail/customer-detail').then(
            (m) => m.CustomerDetail,
          ),
      },

      {
        path: 'discounts',
        loadComponent: () =>
          import('./features/discounts/discount-list/discount-list').then((m) => m.DiscountList),
      },
      {
        path: 'discounts/new',
        loadComponent: () =>
          import('./features/discounts/discount-editor/discount-editor').then(
            (m) => m.DiscountEditor,
          ),
      },
      {
        path: 'discounts/:id/edit',
        loadComponent: () =>
          import('./features/discounts/discount-editor/discount-editor').then(
            (m) => m.DiscountEditor,
          ),
      },

      {
        path: 'shipping',
        loadComponent: () =>
          import('./features/shipping/shipping-list/shipping-list').then((m) => m.ShippingList),
      },
      {
        path: 'shipping/new',
        loadComponent: () =>
          import('./features/shipping/shipping-editor/shipping-editor').then(
            (m) => m.ShippingEditor,
          ),
      },
      {
        path: 'shipping/:id/edit',
        loadComponent: () =>
          import('./features/shipping/shipping-editor/shipping-editor').then(
            (m) => m.ShippingEditor,
          ),
      },

      {
        path: 'content',
        loadComponent: () =>
          import('./features/content/content-list/content-list').then((m) => m.ContentList),
      },
      {
        path: 'content/new',
        loadComponent: () =>
          import('./features/content/content-editor/content-editor').then((m) => m.ContentEditor),
      },
      {
        path: 'content/:id/edit',
        loadComponent: () =>
          import('./features/content/content-editor/content-editor').then((m) => m.ContentEditor),
      },

      {
        path: 'stores',
        loadComponent: () => import('./features/stores/store-list/store-list').then((m) => m.StoreList),
      },
      {
        path: 'stores/new',
        loadComponent: () =>
          import('./features/stores/store-editor/store-editor').then((m) => m.StoreEditor),
      },
      {
        path: 'stores/:id/edit',
        loadComponent: () =>
          import('./features/stores/store-editor/store-editor').then((m) => m.StoreEditor),
      },

      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings-page').then((m) => m.SettingsPage),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
