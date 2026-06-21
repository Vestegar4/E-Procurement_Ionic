import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, IonContent } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { RouterModule } from '@angular/router';

// ▼ 1. IMPORT IKON DARI IONICONS ▼
import { addIcons } from 'ionicons';
import { send, chatbubblesOutline, checkmarkDoneOutline } from 'ionicons/icons';

@Component({
  selector: 'app-customer-service',
  templateUrl: './customer-service.page.html',
  styleUrls: ['./customer-service.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class CustomerServicePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  iconSend = send;
  iconChat = chatbubblesOutline;
  iconCheck = checkmarkDoneOutline;
  message: string = '';
  isSubmitting: boolean = false;
  chats: any[] = []; 
  isLoading: boolean = true;

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController
  ) {
    // ▼ 2. DAFTARKAN IKON AGAR TOMBOL MUNCUL ▼
    addIcons({ send, chatbubblesOutline, checkmarkDoneOutline });
  }

  ngOnInit() {
    this.loadChats();
  }

  loadChats() {
    this.isLoading = true;
    this.http.get(`${environment.apiUrl}/vendor/customer-service`).subscribe({
      next: (res: any) => {
        this.chats = res.data || [];
        this.isLoading = false;
        this.scrollToBottom(); // Auto-scroll ke pesan terbaru
      },
      error: (err) => {
        console.error('Gagal memuat riwayat chat', err);
        this.isLoading = false;
      }
    });
  }

  async submitMessage() {
    if (!this.message || this.message.trim() === '') return;

    this.isSubmitting = true;
    
    this.http.post(`${environment.apiUrl}/vendor/customer-service`, { message: this.message })
      .subscribe({
        next: async (res: any) => {
          this.isSubmitting = false;
          this.message = ''; // Kosongkan input setelah terkirim
          this.loadChats();  // Tarik riwayat pesan baru
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

  // Fungsi UX untuk scroll ke pesan paling bawah
  scrollToBottom() {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToBottom(300);
      }
    }, 100);
  }
}