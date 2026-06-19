import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonBadge, IonButton, IonContent } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { VendorService } from 'src/app/services/vendor.service';

interface DocumentOverviewItem {
  key: string;
  label: string;
  description: string;
  status: 'uploaded' | 'pending' | 'missing';
  fileName: string;
}

@Component({
  selector: 'app-documents',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonButton,
    IonBadge
  ]
})
export class DocumentsPage implements OnInit {
  vendor: any = {};
  documentItems: DocumentOverviewItem[] = this.createDocumentItems();

  constructor(
    private vendorService: VendorService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  private loadProfile() {
    this.vendorService.getProfile().subscribe({
      next: (res: any) => {
        this.vendor = this.extractProfile(res);
        this.documentItems = this.buildDocumentItems(this.vendor);
      },
      error: (err: any) => {
        console.log('DOCUMENT PROFILE ERROR:', err);
        this.vendor = this.authService.getStoredVendorProfile() || {};
        this.documentItems = this.buildDocumentItems(this.vendor);
      }
    });
  }

  get vendorName() {
    return this.vendor?.company_name || this.vendor?.name || 'Vendor';
  }

  getDocumentBadgeClass(status: DocumentOverviewItem['status']) {
    if (status === 'uploaded') {
      return 'app-badge--open';
    }

    if (status === 'pending') {
      return 'app-badge--bidding';
    }

    return 'app-badge--closed';
  }

  getDocumentStatusLabel(status: DocumentOverviewItem['status']) {
    if (status === 'uploaded') {
      return 'Uploaded';
    }

    if (status === 'pending') {
      return 'Pending';
    }

    return 'Missing';
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

  private buildDocumentItems(profile: any) {
    const documents = this.extractDocumentList(profile);

    return this.createDocumentItems().map((item) => {
      const source = this.findDocumentSource(documents, item.key);
      const status = this.resolveStatus(profile, item.key, source);

      return {
        ...item,
        status,
        fileName: this.resolveFileName(profile, item.key, source, status)
      };
    });
  }

  private createDocumentItems(): DocumentOverviewItem[] {
    return [
      {
        key: 'nib',
        label: 'NIB',
        description: 'Nomor Induk Berusaha',
        status: 'missing',
        fileName: 'Belum diunggah'
      },
      {
        key: 'npwp',
        label: 'NPWP',
        description: 'Dokumen pajak perusahaan',
        status: 'missing',
        fileName: 'Belum diunggah'
      },
      {
        key: 'company_profile',
        label: 'Company Profile',
        description: 'Profil perusahaan vendor',
        status: 'missing',
        fileName: 'Belum diunggah'
      },
      {
        key: 'supporting_documents',
        label: 'Supporting Documents',
        description: 'Dokumen pendukung lainnya',
        status: 'missing',
        fileName: 'Belum diunggah'
      }
    ];
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

  private resolveStatus(profile: any, documentKey: string, documentSource: any): DocumentOverviewItem['status'] {
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

  private resolveFileName(profile: any, documentKey: string, documentSource: any, status: string) {
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

  private displayValue(value: any, fallback: string = '-') {
    if (value === undefined || value === null) {
      return fallback;
    }

    const text = String(value).trim();
    return text ? text : fallback;
  }
}
