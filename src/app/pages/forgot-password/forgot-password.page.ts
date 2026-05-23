import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonButton,
  ToastController
} from '@ionic/angular/standalone';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  template: `
    <ion-content class="forgot-page" [fullscreen]="true">
      <div class="forgot-shell">
        <header class="forgot-brand">
          <strong>PROCULUS</strong>
          <span>INSTITUTIONAL EXCELLENCE</span>
        </header>

        <main class="forgot-main">
          <section class="forgot-copy">
            <h1>Reset Password</h1>
            <p>
              Enter your business email and we’ll send secure instructions to recover your procurement account.
            </p>
          </section>

          <section class="app-card forgot-card">
            <div class="field-group">
              <label for="email">Business Email</label>
              <div class="app-input forgot-input">
                <ion-input
                  id="email"
                  type="email"
                  inputmode="email"
                  autocomplete="email"
                  placeholder="executive@enterprise.com"
                  [(ngModel)]="email"
                  name="email">
                </ion-input>
              </div>
            </div>

            <ion-button
              expand="block"
              class="forgot-button-primary"
              (click)="sendResetLink()"
              [disabled]="loading">
              <span>SEND RESET LINK</span>
              <i aria-hidden="true">→</i>
            </ion-button>
          </section>
        </main>

        <footer class="forgot-footer">
          <a routerLink="/login">Back to Sign In</a>
        </footer>
      </div>
    </ion-content>
  `,
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonInput,
    IonButton
  ]
})
export class ForgotPasswordPage {
  email = '';
  loading = false;

  constructor(private toastController: ToastController) {}

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });

    await toast.present();
  }

  sendResetLink() {
    if (!this.email) {
      this.showToast('Email wajib diisi', 'danger');
      return;
    }

    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      this.showToast('Link reset password berhasil dikirim');
    }, 1000);
  }
}
