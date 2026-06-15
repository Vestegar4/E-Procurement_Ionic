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
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
export class RegisterPage {

  company_name = '';
  email = '';
  address = '';
  contact = '';
  password = '';
  password_confirmation = '';
  showPassword = false;
  showConfirmPassword = false;

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

  register() {
    if (
      !this.company_name ||
      !this.email ||
      !this.address ||
      !this.contact ||
      !this.password ||
      !this.password_confirmation
    ) {
      this.showToast('Semua field wajib diisi');
      return;
    }

    if (this.password !== this.password_confirmation) {
      this.showToast('Konfirmasi password tidak sama');
      return;
    }

    this.loading = true;

    console.log('company_name:', this.company_name);

const data = {
  name: this.company_name,
  company_name: this.company_name,
  email: this.email,
  address: this.address,
  phone: this.contact,
  password: this.password,
  password_confirmation: this.password_confirmation
};

console.log('REGISTER DATA:', data);
    this.authService.register(data).subscribe({
      next: (res) => {
        console.log('REGISTER RESPONSE:', res);
        this.loading = false;
        const token = this.authService.extractToken(res);

        if (token) {
          this.authService.persistSession(token, this.authService.extractVendor(res));
          this.showToast(res?.message || 'Register berhasil', 'success');
          void this.router.navigate(['/dashboard']);
          return;
        }

        this.showToast(res?.message || 'Register berhasil', 'success');
        void this.router.navigate(['/login']);
      },
      error: (err) => {
        console.log('REGISTER ERROR:', err);
        console.log('REGISTER ERROR BODY:', err.error);
        this.loading = false;
        this.showToast(err.error?.message || 'Register gagal');
      }
    });
  }

}
