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
        const profile = this.extractProfile(res);

        this.vendor = {
          ...this.vendor,
          ...profile,
          company_name: profile?.company_name || profile?.name || '',
          email: profile?.email || '',
          address: profile?.address || profile?.alamat || '',
          contact: profile?.contact || profile?.phone || profile?.phone_number || '',
          verification_status: profile?.verification_status || profile?.status || '',
          tax_identification: profile?.tax_identification || profile?.tax_id || profile?.npwp || '',
          primary_industry: profile?.primary_industry || profile?.industry || '',
          trust_score: profile?.trust_score ?? profile?.score ?? null
        };
      },
      error: (err: any) => {
        console.log('PROFILE ERROR:', err);
        this.vendor = this.createEmptyVendor();
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
      this.vendor?.verification_status ||
      this.vendor?.primary_industry ||
      this.vendor?.industry
    );
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
