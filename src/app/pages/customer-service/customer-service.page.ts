import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-service',
  templateUrl: './customer-service.page.html',
  styleUrls: ['./customer-service.page.scss'],
  standalone: true, // ▼ INI YANG SEBELUMNYA HILANG ▼
  imports: [IonicModule, CommonModule, FormsModule, RouterModule] // Memanggil UI Ionic
})
export class CustomerServicePage {
  message: string = '';
  isSubmitting: boolean = false;

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  async submitMessage() {
    // 1. Validasi form tidak boleh kosong
    if (!this.message || this.message.trim() === '') {
      const toast = await this.toastCtrl.create({
        message: 'Pesan tidak boleh kosong.',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    this.isSubmitting = true;
    
    // 2. Kirim pesan ke API Laravel
    this.http.post(`${environment.apiUrl}/vendor/customer-service`, { message: this.message })
      .subscribe({
        next: async (res: any) => {
          this.isSubmitting = false;
          this.message = ''; 
          
          const toast = await this.toastCtrl.create({
            message: 'Pengaduan berhasil dikirim ke Admin!',
            duration: 3000,
            color: 'success'
          });
          toast.present();
          
          this.router.navigate(['/dashboard']);
        },
        error: async (err) => {
          this.isSubmitting = false;
          const toast = await this.toastCtrl.create({
            message: 'Gagal mengirim pesan. Silakan periksa koneksi Anda.',
            duration: 3000,
            color: 'danger'
          });
          toast.present();
        }
      });
  }
}