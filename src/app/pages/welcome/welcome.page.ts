import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonCheckbox,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForward,
  businessOutline,
  chevronBack,
  chevronForward,
  documentTextOutline,
  lockClosedOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

interface WelcomeSlide {
  title: string;
  subtitle: string;
  points: string[];
  badge: string;
  icon: string;
}

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox
  ]
})
export class WelcomePage implements OnInit {
  private readonly privacyAgreementKey = 'proculus_privacy_agreed';
  private readonly welcomeSeenKey = 'has_seen_welcome';

  readonly slides: WelcomeSlide[] = [
    {
      title: 'Proculus Vendor Portal',
      subtitle: 'Platform mobile untuk vendor mengikuti tender, mengelola dokumen, dan memantau proses procurement secara profesional.',
      points: [
        'Akses tender aktif',
        'Dashboard vendor',
        'Pengalaman mobile premium'
      ],
      badge: 'Vendor Portal',
      icon: 'business-outline'
    },
    {
      title: 'Tender & Aanwijzing',
      subtitle: 'Lihat detail tender, timeline, dan informasi tambahan dari admin sebelum mengikuti proses bidding.',
      points: [
        'Daftar tender',
        'Detail tender',
        'Aanwijzing dari admin'
      ],
      badge: 'Tender Flow',
      icon: 'document-text-outline'
    },
    {
      title: 'Secure Bidding',
      subtitle: 'Kirim penawaran harga dengan alur bidding berbasis waktu dan pantau aktivitas terbaru.',
      points: [
        'Countdown bidding',
        'Submit penawaran',
        'Live activity feed'
      ],
      badge: 'Bidding',
      icon: 'lock-closed-outline'
    },
    {
      title: 'Privacy Policy',
      subtitle: 'Proculus menggunakan data vendor hanya untuk kebutuhan registrasi, verifikasi, tender, bidding, hasil tender, dan dokumen procurement.',
      points: [
        'Data dikirim ke backend Laravel API',
        'Data digunakan untuk proses e-procurement',
        'Lanjutkan hanya jika menyetujui Privacy Policy'
      ],
      badge: 'Privacy Policy',
      icon: 'shield-checkmark-outline'
    }
  ];

  activeSlide = 0;
  hasAgreed = false;

  constructor(private router: Router) {
    addIcons({
      arrowForward,
      businessOutline,
      chevronBack,
      chevronForward,
      documentTextOutline,
      lockClosedOutline,
      shieldCheckmarkOutline
    });
  }

  ngOnInit(): void {
    if (localStorage.getItem(this.privacyAgreementKey) === 'true') {
      this.hasAgreed = true;
      void this.router.navigate(['/login']);
    }
  }

  get currentSlide(): WelcomeSlide {
    return this.slides[this.activeSlide];
  }

  get isFirstSlide(): boolean {
    return this.activeSlide === 0;
  }

  get isLastSlide(): boolean {
    return this.activeSlide === this.slides.length - 1;
  }

  nextSlide(): void {
    if (!this.isLastSlide) {
      this.activeSlide += 1;
    }
  }

  previousSlide(): void {
    if (!this.isFirstSlide) {
      this.activeSlide -= 1;
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.slides.length) {
      this.activeSlide = index;
    }
  }

  skipToPrivacy(): void {
    this.goToSlide(this.slides.length - 1);
  }

  enterApp(): void {
    if (!this.isLastSlide || !this.hasAgreed) {
      return;
    }

    localStorage.setItem(this.privacyAgreementKey, 'true');
    localStorage.setItem(this.welcomeSeenKey, 'true');
    void this.router.navigate(['/login']);
  }
}
