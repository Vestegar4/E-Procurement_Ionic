import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  AlertController,
  IonBadge,
  IonButton,
  IonContent,
  IonInput,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { TenderService } from 'src/app/services/tender.service';
import { VendorService } from 'src/app/services/vendor.service';

interface VendorDocumentCard {
  key: string;
  label: string;
  hint: string;
  status: 'uploaded' | 'pending' | 'missing';
  fileName: string;
  file: File | null;
  uploading: boolean;
}

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
    IonBadge,
    IonSpinner
  ]
})
export class ProfilePage implements OnInit {
  vendor: any = this.createEmptyVendor();
  myTenders: any[] = [];
  vendorDocuments: VendorDocumentCard[] = this.createDocumentCards();

  constructor(
    private authService: AuthService,
    private vendorService: VendorService,
    private tenderService: TenderService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadMyTenders();
  }

  private loadProfile() {
    this.vendorService.getProfile().subscribe({
      next: (res: any) => {
        this.vendor = this.mapVendorProfile(this.extractProfile(res));
        this.vendorDocuments = this.buildVendorDocuments(this.vendor);
      },
      error: (err: any) => {
        console.log('PROFILE ERROR:', err);
        this.vendor = this.mapVendorProfile(this.authService.getStoredVendorProfile());
        this.vendorDocuments = this.buildVendorDocuments(this.vendor);
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
        this.showToast(res?.message || 'Profil berhasil diperbarui');
        this.loadProfile();
      },
      error: (err: any) => {
        console.log('UPDATE PROFILE ERROR:', err);
        this.showToast(err?.error?.message || 'Gagal memperbarui profil', 'danger');
      }
    });
  }

  async openHelpCenter() {
    const targetUrl = 'https://proculus.dartd.my.id';
    const capacitor = (window as any).Capacitor;
    const browser = capacitor?.Plugins?.Browser || capacitor?.Browser;

    if (browser?.open) {
      try {
        await browser.open({ url: targetUrl });
        return;
      } catch (error) {
        console.log('BROWSER OPEN ERROR:', error);
      }
    }

    window.open(targetUrl, '_system');
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Keluar dari akun?',
      message: 'Apakah Anda yakin ingin keluar?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Logout',
          role: 'destructive',
          handler: () => this.performLogout()
        }
      ]
    });

    await alert.present();
  }

  onVendorDocumentSelected(documentKey: string, event: Event) {
    const target = event.target as HTMLInputElement;
    const selectedFile = target?.files?.[0] || null;

    this.vendorDocuments = this.vendorDocuments.map((document) =>
      document.key === documentKey
        ? {
            ...document,
            file: selectedFile,
            status: selectedFile ? 'pending' : document.status,
            fileName: selectedFile ? selectedFile.name : document.fileName
          }
        : document
    );
  }

  uploadVendorDocument(documentKey: string) {
    const targetDocument = this.vendorDocuments.find((document) => document.key === documentKey);

    if (!targetDocument?.file) {
      this.showToast('Pilih file terlebih dahulu', 'danger');
      return;
    }

    this.vendorDocuments = this.vendorDocuments.map((document) =>
      document.key === documentKey
        ? {
            ...document,
            uploading: true
          }
        : document
    );

    this.vendorService.uploadDocument({
      type: documentKey,
      file: targetDocument.file
    }).subscribe({
      next: (res: any) => {
        this.showToast(res?.message || 'Dokumen berhasil diunggah');
        this.loadProfile();
      },
      error: (err: any) => {
        console.log('UPLOAD DOCUMENT ERROR:', err);
        this.vendorDocuments = this.vendorDocuments.map((document) =>
          document.key === documentKey
            ? {
                ...document,
                uploading: false
              }
            : document
        );
        this.showToast(err?.error?.message || 'Gagal mengunggah dokumen', 'danger');
      }
    });
  }

  get vendorInitial() {
    const name = this.displayValue(this.vendor?.company_name || this.vendor?.name);
    return name !== '-' ? name.charAt(0).toUpperCase() : 'V';
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

    return 'app-badge--closed';
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

    return index === 0 ? 'Belum tersedia' : '-';
  }

  getTenderTitle(tender: any) {
    return this.displayValue(tender?.title || tender?.name, 'Belum tersedia');
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
      return `${this.formatCurrency(amount)} Estimasi`;
    }

    return 'Belum tersedia';
  }

  getDocumentBadgeClass(status: VendorDocumentCard['status']) {
    if (status === 'uploaded') {
      return 'app-badge--open';
    }

    if (status === 'pending') {
      return 'app-badge--bidding';
    }

    return 'app-badge--closed';
  }

  getDocumentStatusLabel(status: VendorDocumentCard['status']) {
    if (status === 'uploaded') {
      return 'Uploaded';
    }

    if (status === 'pending') {
      return 'Pending';
    }

    return 'Missing';
  }

  private performLogout() {
    this.authService.logoutApi().subscribe({
      next: () => this.authService.logout(),
      error: () => this.authService.logout()
    });
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

  private buildVendorDocuments(profile: any) {
    const documentSources = this.extractDocumentList(profile);

    return this.createDocumentCards().map((card) => {
      const match = this.findDocumentSource(documentSources, card.key);
      const status = this.resolveDocumentStatus(profile, card.key, match);

      return {
        ...card,
        status,
        fileName: this.resolveDocumentFileName(profile, card.key, match, status)
      };
    });
  }

  private findDocumentSource(documentSources: any[], documentKey: string) {
    const normalizedDocumentKey = this.normalizeDocumentKey(documentKey);

    return documentSources.find((document) => {
      const candidateKey = this.normalizeDocumentKey(
        document?.type ||
        document?.document_type ||
        document?.category ||
        document?.name
      );

      if (!candidateKey) {
        return false;
      }

      return candidateKey.includes(normalizedDocumentKey) || normalizedDocumentKey.includes(candidateKey);
    }) || null;
  }

  private resolveDocumentStatus(profile: any, documentKey: string, documentSource: any): VendorDocumentCard['status'] {
    const rawStatus = this.normalizeDocumentStatus(
      documentSource?.status ||
      documentSource?.upload_status ||
      documentSource?.verification_status ||
      documentSource?.approval_status ||
      profile?.[`${documentKey}_status`] ||
      profile?.[`${documentKey}Status`]
    );

    if (rawStatus === 'uploaded' || rawStatus === 'pending' || rawStatus === 'missing') {
      return rawStatus;
    }

    if (documentSource) {
      return 'pending';
    }

    return this.hasProfileDocument(profile, documentKey) ? 'uploaded' : 'missing';
  }

  private resolveDocumentFileName(profile: any, documentKey: string, documentSource: any, status: string) {
    const directValue =
      documentSource?.filename ||
      documentSource?.name ||
      documentSource?.file_name ||
      documentSource?.document_name ||
      profile?.[`${documentKey}_filename`] ||
      profile?.[`${documentKey}FileName`] ||
      profile?.[`${documentKey}_file`] ||
      profile?.[documentKey];

    const text = this.displayValue(directValue, '');

    if (text) {
      return text;
    }

    if (status === 'uploaded') {
      return 'Dokumen tersimpan';
    }

    return 'Belum diunggah';
  }

  private extractDocumentList(profile: any) {
    const candidates = [
      profile?.documents,
      profile?.vendor_documents,
      profile?.document_uploads,
      profile?.attachments,
      profile?.data?.documents,
      profile?.data?.vendor_documents
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }

    return [];
  }

  private hasProfileDocument(profile: any, documentKey: string) {
    const keys = [
      documentKey,
      `${documentKey}_file`,
      `${documentKey}_filename`,
      `${documentKey}File`,
      `${documentKey}FileName`
    ];

    return keys.some((key) => this.hasTruthyValue(profile?.[key]));
  }

  private createDocumentCards(): VendorDocumentCard[] {
    return [
      {
        key: 'nib',
        label: 'Upload NIB',
        hint: 'Nomor Induk Berusaha',
        status: 'missing',
        fileName: 'Belum diunggah',
        file: null,
        uploading: false
      },
      {
        key: 'npwp',
        label: 'Upload NPWP',
        hint: 'Dokumen pajak perusahaan',
        status: 'missing',
        fileName: 'Belum diunggah',
        file: null,
        uploading: false
      },
      {
        key: 'company_profile',
        label: 'Upload Company Profile',
        hint: 'Profil perusahaan vendor',
        status: 'missing',
        fileName: 'Belum diunggah',
        file: null,
        uploading: false
      },
      {
        key: 'supporting_documents',
        label: 'Upload Supporting Documents',
        hint: 'Dokumen pendukung lainnya',
        status: 'missing',
        fileName: 'Belum diunggah',
        file: null,
        uploading: false
      }
    ];
  }

  private normalizeDocumentKey(value: string) {
    return String(value || '')
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeDocumentStatus(value: any): 'uploaded' | 'pending' | 'missing' | '' {
    const status = String(value || '').toLowerCase().trim();

    if (['uploaded', 'approved', 'verified', 'complete', 'completed'].includes(status)) {
      return 'uploaded';
    }

    if (['pending', 'review', 'submitted', 'waiting', 'in_review'].includes(status)) {
      return 'pending';
    }

    if (['missing', 'not_available', 'unavailable', 'absent', 'none'].includes(status)) {
      return 'missing';
    }

    return '';
  }

  private hasTruthyValue(value: any) {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (value === undefined || value === null) {
      return false;
    }

    return String(value).trim() !== '';
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
