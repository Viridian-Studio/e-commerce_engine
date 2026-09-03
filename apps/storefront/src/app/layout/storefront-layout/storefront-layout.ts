import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { CartDrawer } from '../cart-drawer/cart-drawer';
import { AnnouncementBar } from '../announcement-bar/announcement-bar';

@Component({
  selector: 'app-storefront-layout',
  imports: [RouterOutlet, Header, Footer, CartDrawer, AnnouncementBar],
  template: `
    <app-announcement-bar />
    <app-header />
    <main class="min-h-[60vh]">
      <router-outlet />
    </main>
    <app-footer />
    <app-cart-drawer />
  `,
})
export class StorefrontLayout {}
