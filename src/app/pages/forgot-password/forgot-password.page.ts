import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';

type ForgotPasswordStep = 'email' | 'otp' | 'password';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonInput,
    IonButton,
    IonSpinner
  ]
})
export class ForgotPasswordPage {
  step: ForgotPasswordStep = 'email';
  email = '';
  otp = '';
  password = '';
  passwordConfirmation = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });

    await toast.present();
  }

  requestOtp() {
    if (!this.email) {
      this.showToast('Email wajib diisi', 'danger');
      return;
    }

    this.loading = true;

    this.authService.requestPasswordResetOtp({ email: this.email }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.step = 'otp';
        this.showToast(res?.message || 'OTP berhasil dikirim ke email Anda');
      },
      error: (err: any) => {
        this.loading = false;
        this.showToast(err?.error?.message || 'Gagal mengirim OTP', 'danger');
      }
    });
  }

  verifyOtp() {
    if (!this.email || !this.otp) {
      this.showToast('Email dan OTP wajib diisi', 'danger');
      return;
    }

    this.loading = true;

    this.authService.verifyPasswordResetOtp({
      email: this.email,
      otp: this.otp
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.step = 'password';
        this.showToast(res?.message || 'OTP terverifikasi');
      },
      error: (err: any) => {
        this.loading = false;
        this.showToast(err?.error?.message || 'OTP tidak valid', 'danger');
      }
    });
  }

  resetPassword() {
    if (!this.password || !this.passwordConfirmation) {
      this.showToast('Password baru wajib diisi', 'danger');
      return;
    }

    if (this.password !== this.passwordConfirmation) {
      this.showToast('Konfirmasi password tidak sama', 'danger');
      return;
    }

    this.loading = true;

    this.authService.resetPasswordWithOtp({
      email: this.email,
      otp: this.otp,
      password: this.password,
      password_confirmation: this.passwordConfirmation
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.showToast(res?.message || 'Password berhasil diperbarui');
        void this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.loading = false;
        this.showToast(err?.error?.message || 'Gagal memperbarui password', 'danger');
      }
    });
  }

  back(): void {
    if (this.step === 'password') {
      this.step = 'otp';
      return;
    }

    this.step = 'email';
  }

  get currentStepIndex(): number {
    return this.step === 'email' ? 1 : this.step === 'otp' ? 2 : 3;
  }
}
