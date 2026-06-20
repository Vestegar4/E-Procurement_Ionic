import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

interface NotificationItem {
  title: string;
  description: string;
  time: string;
  badge: string;
  type: 'announcement' | 'system' | 'update';
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent
  ]
})
export class NotificationsPage {
  tenderAnnouncements: NotificationItem[] = [
    {
      title: 'Tender Infrastruktur Jaringan Dibuka',
      description: 'Pendaftaran vendor untuk paket jaringan kampus dibuka hingga 28 Juni 2026.',
      time: '5 menit lalu',
      badge: 'Tender',
      type: 'announcement'
    },
    {
      title: 'Perubahan Jadwal Klarifikasi',
      description: 'Sesi aanwijzing untuk pengadaan perangkat akan dimulai pukul 14.00 WIB.',
      time: '1 jam lalu',
      badge: 'Tender',
      type: 'announcement'
    }
  ];

  systemNotifications: NotificationItem[] = [
    {
      title: 'Verifikasi vendor diperbarui',
      description: 'Status akun Anda kini menunggu tinjauan admin setelah dokumen terbaru masuk.',
      time: 'Hari ini',
      badge: 'Sistem',
      type: 'system'
    },
    {
      title: 'OTP login aman aktif',
      description: 'Proculus mengirimkan OTP melalui kanal email untuk proses pemulihan akun.',
      time: 'Kemarin',
      badge: 'Sistem',
      type: 'system'
    }
  ];

  procurementUpdates: NotificationItem[] = [
    {
      title: 'Dokumen pendukung diterima',
      description: 'File pendukung yang Anda unggah tercatat di alur administrasi procurement.',
      time: '2 hari lalu',
      badge: 'Update',
      type: 'update'
    },
    {
      title: 'Review penawaran sedang berlangsung',
      description: 'Tim evaluasi sedang meninjau tender aktif yang Anda ikuti minggu ini.',
      time: '3 hari lalu',
      badge: 'Update',
      type: 'update'
    }
  ];
}
