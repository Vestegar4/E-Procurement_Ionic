import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonButton,
  IonBadge,
  ToastController
} from '@ionic/angular/standalone';

import { RouterModule } from '@angular/router';
import { VendorService } from 'src/app/services/vendor.service';
import { TenderService } from 'src/app/services/tender.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonInput,
    IonButton,
    IonBadge
  ]
})
export class ProfilePage implements OnInit {
  vendor: any = this.createEmptyVendor();
  myTenders: any[] = [];

  constructor(
    private authService: AuthService,
    private vendorService: VendorService,
    private tenderService: TenderService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadMyTenders();
  }

  private loadProfile() {
    this.vendorService.getProfile().subscribe({
      next: (res: any) => {
        this.vendor = this.mapVendorProfile(this.extractProfile(res));
      },
      error: (err: any) => {
        console.log('PROFILE ERROR:', err);
        this.vendor = this.mapVendorProfile(this.authService.getStoredVendorProfile());
      }
    });
  }

  private loadMyTenders() {
    this.tenderService.getMyTenders().subscribe({
      next: (res: any) => {
        this.myTenders = this.extractTenderList(res);
      },
      error: (err: any) => {
        console.log('MY TENDERS PROFILE ERROR:', err);
        this.myTenders = [];
      }
    });
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });

    await toast.present();
  }

  saveProfile() {
    const payload = {
      ...this.vendor,
      phone: this.vendor.contact || this.vendor.phone
    };

    this.vendorService.updateProfile(payload).subscribe({
      next: (res: any) => {
        this.showToast(res?.message || 'Profile berhasil diperbarui');
      },
      error: (err: any) => {
        console.log('UPDATE PROFILE ERROR:', err);
        this.showToast(err?.error?.message || 'Gagal memperbarui profile', 'danger');
      }
    });
  }

  get vendorInitial() {
    const name = this.displayValue(this.vendor?.company_name || this.vendor?.name);
    return name !== '-' ? name.charAt(0).toUpperCase() : '-';
  }

  get profileHeadline() {
    return this.displayValue(this.vendor?.company_name || this.vendor?.name);
  }

  get profileSubtitle() {
    return this.displayValue(
      this.vendorVerificationStatusLabel ||
      this.vendor?.primary_industry ||
      this.vendor?.industry
    );
  }

  get vendorVerificationStatus() {
    return this.authService.getVendorVerificationStatus(this.vendor);
  }

  get vendorVerificationStatusLabel() {
    return this.authService.formatVerificationStatus(this.vendor, '');
  }

  get vendorVerificationBadgeClass() {
    if (this.vendorVerificationStatus === 'approved') {
      return 'app-badge--open';
    }

    if (this.vendorVerificationStatus === 'pending') {
      return 'app-badge--bidding';
    }

    if (this.vendorVerificationStatus === 'rejected') {
      return 'app-badge--closed';
    }

    return '';
  }

  displayValue(value: any, fallback: string = '-') {
    if (value === undefined || value === null) {
      return fallback;
    }

    const text = String(value).trim();
    return text ? text : fallback;
  }

  displayTrustScore() {
    const score = Number(this.vendor?.trust_score);

    if (!Number.isFinite(score)) {
      return '-';
    }

    return String(score);
  }

  getTenderReference(tender: any, index: number) {
    if (tender?.reference_number || tender?.reference_no || tender?.code) {
      return tender.reference_number || tender.reference_no || tender.code;
    }

    if (tender?.id) {
      return `#${tender.id}`;
    }

    return index === 0 ? 'Not available' : '-';
  }

  getTenderTitle(tender: any) {
    return this.displayValue(tender?.title || tender?.name, 'Not available');
  }

  getTenderValue(tender: any) {
    const amount = Number(
      tender?.budget ||
      tender?.estimated_budget ||
      tender?.budget_value ||
      tender?.project_value ||
      tender?.value
    );

    if (Number.isFinite(amount) && amount > 0) {
      return `${this.formatCurrency(amount)} Valuation`;
    }

    return 'Not available';
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

  private extractTenderList(res: any) {
    if (Array.isArray(res)) {
      return res;
    }

    if (Array.isArray(res?.tenders)) {
      return res.tenders;
    }

    if (Array.isArray(res?.data?.tenders)) {
      return res.data.tenders;
    }

    if (Array.isArray(res?.data)) {
      return res.data;
    }

    return [];
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

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
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
