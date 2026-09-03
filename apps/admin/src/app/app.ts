import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHost } from './shared/toast/toast-host';
import { ConfirmDialogHost } from './shared/confirm-dialog/confirm-dialog-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHost, ConfirmDialogHost],
  templateUrl: './app.html',
})
export class App {}
