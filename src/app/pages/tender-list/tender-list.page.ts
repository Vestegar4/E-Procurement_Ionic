import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonBadge,
  ActionSheetController,
  ToastController
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { TenderService } from 'src/app/services/tender.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tender-list',
  templateUrl: './tender-list.page.html',
  styleUrls: ['./tender-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonBadge
  ]
})
export class TenderListPage implements OnInit {
  tenders: any[] = [];
  searchQuery = '';
  activeCategory: 'all' | 'infrastructure' = 'all';
  loading = false;
  private savedTenderIds = new Set<number>();
  private bookmarkStorageKey = 'vendor_saved_tenders:guest';
  vendorInitial = 'V';

  constructor(
    private tenderService: TenderService,
    private authService: AuthService,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadTenders();
    this.loadProfile();
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 1800,
      color
    });

    await toast.present();
  }

  loadProfile() {
    this.authService.me().subscribe({
      next: (res: any) => {
        const vendor = res?.data?.vendor || res?.vendor || res?.data || res;
        const name = vendor?.company_name || vendor?.name || 'Vendor';
        this.vendorInitial = name.charAt(0).toUpperCase();
        this.bookmarkStorageKey = this.getBookmarkStorageKey(vendor);
        this.loadSavedTenders();
      },
      error: () => {
        const vendor: any = this.authService.getStoredVendorProfile();
        const name = vendor?.company_name || vendor?.name || 'V';
        this.vendorInitial = name.charAt(0).toUpperCase();
        this.bookmarkStorageKey = this.getBookmarkStorageKey(vendor);
        this.loadSavedTenders();
      }
    });
  }

  loadTenders() {
    this.loading = true;

    this.tenderService.getTenders().subscribe({
      next: (res: any) => {
        console.log('TENDERS RESPONSE:', res);

        // Perbaikan deteksi array data dari API
        let rawData = [];
        if (Array.isArray(res?.data?.data)) {
          rawData = res.data.data;
        } else if (Array.isArray(res?.data)) {
          rawData = res.data;
        } else if (Array.isArray(res)) {
          rawData = res;
        }

        this.tenders = rawData.map((tender: any) => ({
          ...tender,
          title: tender?.title || tender?.name || '-',
          description: tender?.description || tender?.summary || '-',
          status: tender?.effective_status || tender?.status || '-',
          status_key: String(tender?.effective_status || tender?.status || '')
            .toLowerCase()
            .trim()
        }));

        this.loading = false;
      },
      error: (err: any) => {
        console.log('TENDERS ERROR:', err);
        this.tenders = [];
        this.loading = false;
      }
    });
  }

  get featuredTender() {
    return this.filteredTenders.length ? this.filteredTenders[0] : null;
  }

  get filteredTenders() {
    return this.tenders.filter(tender => {
      const matchesCategory =
        this.activeCategory === 'all' || this.isInfrastructureTender(tender);

      const matchesSearch = this.matchesSearch(tender);

      return matchesCategory && matchesSearch;
    });
  }

  setCategory(category: 'all' | 'infrastructure') {
    this.activeCategory = category;
  }

  async openTenderMenu() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Filter Tender',
      buttons: [
        {
          text: 'Semua Tender',
          handler: () => this.setCategory('all')
        },
        {
          text: 'Infrastruktur',
          handler: () => this.setCategory('infrastructure')
        },
        {
          text: 'Tutup',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  toggleBookmark(tender: any, event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();

    const tenderId = this.extractTenderId(tender);

    if (!tenderId) {
      return;
    }

    if (this.savedTenderIds.has(tenderId)) {
      this.savedTenderIds.delete(tenderId);
      this.showToast('Tender dihapus dari tersimpan');
    } else {
      this.savedTenderIds.add(tenderId);
      this.showToast('Tender disimpan');
    }

    this.persistSavedTenders();
  }

  isTenderBookmarked(tender: any) {
    const tenderId = this.extractTenderId(tender);
    return tenderId ? this.savedTenderIds.has(tenderId) : false;
  }

  getDisplayValue(value: any, fallback: string = '-') {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }

    return String(value);
  }

  getBudgetValue(tender: any) {
    const value =
      tender?.budget ||
      tender?.estimated_budget ||
      tender?.est_budget ||
      tender?.price ||
      tender?.project_value ||
      tender?.value;

    if (!value) {
      return '-';
    }

    const numberValue = Number(String(value).replace(/[^0-9.-]/g, ''));

    if (!Number.isFinite(numberValue) || numberValue <= 0) {
      return '-';
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(numberValue);
  }

  getClosingDateValue(tender: any) {
    const rawDate =
      tender?.timeline?.bidding_end ||
      tender?.timeline?.registration_end ||
      tender?.closing_date ||
      tender?.end_date ||
      tender?.deadline ||
      tender?.created_at;

    if (!rawDate) {
      return '-';
    }

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  private loadSavedTenders() {
    const rawValue = localStorage.getItem(this.bookmarkStorageKey);

    if (!rawValue) {
      this.savedTenderIds = new Set<number>();
      return;
    }

    try {
      const parsedValue = JSON.parse(rawValue);
      const ids = Array.isArray(parsedValue) ? parsedValue : [];
      this.savedTenderIds = new Set(
        ids
          .map((value: any) => Number(value))
          .filter((value: number) => Number.isFinite(value) && value > 0)
      );
    } catch {
      this.savedTenderIds = new Set<number>();
    }
  }

  private persistSavedTenders() {
    localStorage.setItem(
      this.bookmarkStorageKey,
      JSON.stringify(Array.from(this.savedTenderIds))
    );
  }

  private getBookmarkStorageKey(vendor?: any) {
    const profile = vendor || this.authService.getStoredVendorProfile() || {};
    const vendorKey = profile?.id || profile?.vendor_id || profile?.email || profile?.company_name || profile?.name || 'guest';

    return `vendor_saved_tenders:${String(vendorKey).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  }

  private extractTenderId(tender: any) {
    const candidate = tender?.id || tender?.tender_id || tender?.tender?.id;
    const numericId = Number(candidate);

    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  }

  private matchesSearch(tender: any) {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const haystack = [
      tender.title,
      tender.name,
      tender.description,
      tender.status,
      tender.effective_status,
      tender.start_date,
      tender.end_date,
      tender.created_at
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  }

  private isInfrastructureTender(tender: any) {
    const text = [
      tender.title,
      tender.name,
      tender.description
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const infrastructureKeywords = [
      'internet',
      'network',
      'infrastruktur',
      'infrastructure',
      'cloud',
      'data',
      'digital',
      'server',
      'smart city',
      'it',
      'mbg',
      'dapur'
    ];

    return infrastructureKeywords.some(keyword => text.includes(keyword));
  }
}
