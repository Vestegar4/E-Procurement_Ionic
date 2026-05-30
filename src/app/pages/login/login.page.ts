import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonButton,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';

import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonInput,
    IonButton,
    IonSpinner,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class LoginPage {

  email = '';
  password = '';
  showPassword = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });

    await toast.present();
  }

  login() {
  if (!this.email || !this.password) {
    this.showToast('Email dan password wajib diisi');
    return;
  }

  this.loading = true;

  const data = {
    email: this.email,
    password: this.password
  };

  this.authService.login(data).subscribe({
    next: (res) => {
      this.loading = false;

      console.log('LOGIN RESPONSE:', res);

      const token = this.authService.extractToken(res);

      if (!token) {
        this.showToast('Token tidak ditemukan dari backend');
        return;
      }

      this.authService.persistSession(token, this.authService.extractVendor(res));

      this.showToast('Login berhasil', 'success');

      void this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      this.loading = false;

      console.log('LOGIN ERROR:', err);

      this.showToast(err?.error?.message || 'Login gagal, cek email/password atau endpoint');
    }
  });
}


}
