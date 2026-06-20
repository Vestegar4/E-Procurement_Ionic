import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { VendorService } from 'src/app/services/vendor.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
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
export class EditProfilePage implements OnInit {
  vendor: any = this.createEmptyVendor();
  avatarUrl: string | null = null;
  saving = false;

  constructor(
    private authService: AuthService,
    private vendorService: VendorService,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  private loadProfile() {
    this.vendorService.getProfile().subscribe({
      next: (res: any) => {
        this.vendor = this.mapVendorProfile(this.extractProfile(res));
        this.loadAvatar();
      },
      error: (err: any) => {
        console.log('EDIT PROFILE LOAD ERROR:', err);
        this.vendor = this.mapVendorProfile(this.authService.getStoredVendorProfile());
        this.loadAvatar();
      }
    });
  }

  private loadAvatar() {
    this.avatarUrl = localStorage.getItem('vendor_avatar');
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    await toast.present();
  }

  onAvatarSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (!fileInput.files || fileInput.files.length === 0) {
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      localStorage.setItem('vendor_avatar', base64String);
      this.avatarUrl = base64String;
      this.showToast('Foto profil berhasil diperbarui secara lokal');
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    this.saving = true;
    const payload = {
      ...this.vendor,
      phone: this.vendor.contact || this.vendor.phone
    };

    this.vendorService.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.showToast(res?.message || 'Profil berhasil diperbarui');
        this.router.navigate(['/profile']);
      },
      error: (err: any) => {
        console.log('UPDATE PROFILE ERROR:', err);
        this.saving = false;
        this.showToast(err?.error?.message || 'Gagal memperbarui profil', 'danger');
      }
    });
  }

  get vendorInitial() {
    const name = this.displayValue(this.vendor?.company_name || this.vendor?.name);
    return name !== '-' ? name.charAt(0).toUpperCase() : 'V';
  }

  get vendorVerificationStatusLabel() {
    return this.authService.formatVerificationStatus(this.vendor, '');
  }

  get registrationDateLabel() {
    const rawDate = this.vendor?.created_at || this.vendor?.registration_date;
    if (!rawDate) {
      return 'Tidak tersedia';
    }
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) {
      return 'Tidak tersedia';
    }
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  displayValue(value: any, fallback: string = '-') {
    if (value === undefined || value === null) {
      return fallback;
    }

    const text = String(value).trim();
    return text ? text : fallback;
  }

  private extractProfile(res: any) {
    return (
      res?.vendor ||
      res?.user ||
      res?.data?.vendor ||
      res?.data?.user ||
      res?.data ||
      res ||
      {}
    );
  }

  private mapVendorProfile(profile: any) {
    const source = profile || {};

    return {
      ...this.createEmptyVendor(),
      ...source,
      company_name: source?.company_name || source?.name || '',
      email: source?.email || '',
      address: source?.address || source?.alamat || '',
      contact: source?.contact || source?.phone || source?.phone_number || '',
      verification_status: this.authService.getVendorVerificationStatus(source),
      tax_identification: source?.tax_identification || source?.tax_id || source?.npwp || '',
      primary_industry: source?.primary_industry || source?.industry || '',
      trust_score: source?.trust_score ?? source?.score ?? null
    };
  }

  private createEmptyVendor() {
    return {
      company_name: '',
      email: '',
      address: '',
      contact: '',
      verification_status: '',
      tax_identification: '',
      primary_industry: '',
      trust_score: null
    };
  }
}
