import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { TenderService } from 'src/app/services/tender.service';
import { BiddingService } from 'src/app/services/bidding.service';
import { ResultService } from 'src/app/services/result.service';

interface DashboardActivity {
  type: 'bid' | 'result';
  title: string;
  status: string;
  description: string;
  timestamp: string;
  tenderId: number | null;
  routeLink: any[] | string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonButton
  ]
})
export class DashboardPage implements OnInit {
  vendor: any = null;
  tenders: any[] = [];
  myTenders: any[] = [];
  bids: any[] = [];
  results: any[] = [];
  recentActivities: DashboardActivity[] = [];
  activeBids = 0;
  totalWon = 0;

  loading = true;
  private pendingLoads = 0;

  constructor(
    private authService: AuthService,
    private tenderService: TenderService,
    private biddingService: BiddingService,
    private resultService: ResultService
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;
    this.pendingLoads = 5;

    this.authService.me().subscribe({
      next: (res) => {
        this.vendor = this.extractItem(res, ['vendor', 'user']);
        this.completeLoad();
      },
      error: (err) => {
        console.log('ME ERROR:', err);
        this.vendor = this.authService.getStoredVendorProfile();
        this.completeLoad();
      }
    });

    this.tenderService.getTenders().subscribe({
      next: (res) => {
        this.tenders = this.extractList(res, ['tenders', 'data']);
        this.buildRecentActivities();
        this.completeLoad();
      },
      error: (err) => {
        console.log('TENDERS ERROR:', err);
        this.tenders = [];
        this.buildRecentActivities();
        this.completeLoad();
      }
    });

    this.tenderService.getMyTenders().subscribe({
      next: (res) => {
        this.myTenders = this.extractList(res, ['tenders', 'data']);
        this.buildRecentActivities();
        this.completeLoad();
      },
      error: (err) => {
        console.log('MY TENDERS ERROR:', err);
        this.myTenders = [];
        this.buildRecentActivities();
        this.completeLoad();
      }
    });

    this.biddingService.getMyBids().subscribe({
      next: (res) => {
        this.bids = this.extractList(res, ['bids', 'data']);
        this.activeBids = this.bids.filter((bid) => this.isActiveBid(bid)).length;
        this.buildRecentActivities();
        this.completeLoad();
      },
      error: (err) => {
        console.log('BIDS ERROR:', err);
        this.bids = [];
        this.activeBids = 0;
        this.buildRecentActivities();
        this.completeLoad();
      }
    });

    this.resultService.getResults().subscribe({
      next: (res) => {
        this.results = this.extractList(res, ['results', 'data']);
        this.totalWon = this.results.filter((result) => this.isWonResult(result)).length;
        this.buildRecentActivities();
        this.completeLoad();
      },
      error: (err) => {
        console.log('RESULTS ERROR:', err);
        this.results = [];
        this.totalWon = 0;
        this.buildRecentActivities();
        this.completeLoad();
      }
    });
  }

  get displayVendorName() {
    return (
      this.vendor?.company_name ||
      this.vendor?.name ||
      this.vendor?.vendor_name ||
      ''
    );
  }

  get vendorInitial() {
    return this.displayVendorName
      ? this.displayVendorName.charAt(0).toUpperCase()
      : 'V';
  }

  get latestWonResultLink() {
    const latestWon = this.results.find((result) => this.isWonResult(result));
    const tenderId = this.extractTenderId(latestWon);

    return tenderId ? ['/result', tenderId] : '/result';
  }

  formatStatCount(value: number) {
    return String(value || 0).padStart(2, '0');
  }

  get vendorVerificationStatus() {
    return this.authService.getVendorVerificationStatus(this.vendor);
  }

  get vendorVerificationStatusLabel() {
    return this.authService.formatVerificationStatus(this.vendor, '');
  }

  get vendorVerificationMessage() {
    if (!this.vendorVerificationStatus) {
      return '';
    }

    return this.authService.isVendorApproved(this.vendor)
      ? 'Vendor Anda siap mengikuti tender aktif hari ini.'
      : 'Akun vendor masih menunggu approval admin.';
  }

  getBadgeClass(status: string) {
    const normalizedStatus = String(status || '').toLowerCase();

    if (normalizedStatus === 'open') {
      return 'app-badge--open';
    }

    if (
      normalizedStatus === 'bidding' ||
      normalizedStatus === 'pending' ||
      normalizedStatus === 'submitted' ||
      normalizedStatus === 'active'
    ) {
      return 'app-badge--bidding';
    }

    if (normalizedStatus === 'won' || normalizedStatus === 'finished') {
      return 'app-badge--finished';
    }

    return 'app-badge--closed';
  }

  get activeTenderCount() {
    return this.tenders.filter((tender) => this.isActiveTender(tender)).length;
  }

  get potentialValue() {
    const totalValue = this.tenders
      .filter((tender) => this.isActiveTender(tender))
      .reduce((sum, tender) => sum + this.extractTenderValue(tender), 0);

    return totalValue;
  }

  get nearestDeadlineTender() {
    const activeTenders = this.tenders
      .filter((tender) => this.isActiveTender(tender))
      .map((tender) => ({
        tender,
        deadline: this.extractTenderDeadline(tender)
      }))
      .filter((entry) => entry.deadline !== null)
      .sort((first, second) => first.deadline!.getTime() - second.deadline!.getTime());

    return activeTenders.length ? activeTenders[0] : null;
  }

  get nearestDeadlineLabel() {
    if (!this.nearestDeadlineTender) {
      return 'Tidak tersedia';
    }

    return this.formatDate(this.nearestDeadlineTender.deadline);
  }

  get nearestDeadlineTitle() {
    return this.nearestDeadlineTender
      ? this.resolveTenderTitle(this.nearestDeadlineTender.tender)
      : 'Belum ada tender aktif';
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

  private extractList(res: any, keys: string[]) {
    if (Array.isArray(res)) {
      return res;
    }

    for (const key of keys) {
      if (Array.isArray(res?.[key])) {
        return res[key];
      }
    }

    if (Array.isArray(res?.data)) {
      return res.data;
    }

    return [];
  }

  private extractItem(res: any, keys: string[]) {
    for (const key of keys) {
      if (res?.[key]) {
        return res[key];
      }
      if (res?.data?.[key]) {
        return res.data[key];
      }
    }

    return res?.data || res || null;
  }

  getVerificationBadgeClass(status: string) {
    const normalizedStatus = this.authService.normalizeVerificationStatus(status);

    if (normalizedStatus === 'approved') {
      return 'app-badge--open';
    }

    if (normalizedStatus === 'pending') {
      return 'app-badge--bidding';
    }

    if (normalizedStatus === 'rejected') {
      return 'app-badge--closed';
    }

    return 'app-badge--closed';
  }

  private completeLoad() {
    this.pendingLoads = Math.max(this.pendingLoads - 1, 0);
    this.loading = this.pendingLoads > 0;
  }

  private isActiveTender(tender: any) {
    const status = String(
      tender?.effective_status ||
      tender?.status ||
      tender?.status_key ||
      ''
    ).toLowerCase();

    return ['open', 'bidding', 'active', 'pending'].includes(status);
  }

  private extractTenderValue(tender: any) {
    const rawValue =
      tender?.budget ||
      tender?.estimated_budget ||
      tender?.budget_value ||
      tender?.project_value ||
      tender?.value ||
      tender?.estimated_value;

    const numericValue = Number(String(rawValue || '').replace(/[^0-9.-]/g, ''));

    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
  }

  private extractTenderDeadline(tender: any) {
    const rawDate =
      tender?.timeline?.bidding_end ||
      tender?.timeline?.registration_end ||
      tender?.closing_date ||
      tender?.end_date ||
      tender?.deadline ||
      tender?.due_date;

    if (!rawDate) {
      return null;
    }

    const parsedDate = new Date(rawDate);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  private buildRecentActivities() {
    const bidActivities = this.bids.map((bid) => this.mapBidActivity(bid));
    const resultActivities = this.results.map((result) => this.mapResultActivity(result));

    this.recentActivities = [...resultActivities, ...bidActivities]
      .sort((a, b) => this.getActivityTimestampValue(b) - this.getActivityTimestampValue(a))
      .slice(0, 3);
  }

  private mapBidActivity(bid: any): DashboardActivity {
    const tenderId = this.extractTenderId(bid);
    const amount = Number(bid?.amount || bid?.bid_amount || bid?.value || 0);

    return {
      type: 'bid',
      title: this.resolveTenderTitle(bid),
      status: String(bid?.status || '').toLowerCase(),
      description: amount > 0 ? `Bid submitted: ${this.formatCurrency(amount)}` : '',
      timestamp: bid?.created_at || bid?.updated_at || '',
      tenderId,
      routeLink: tenderId ? ['/bidding', tenderId] : '/bidding'
    };
  }

  private mapResultActivity(result: any): DashboardActivity {
    const tenderId = this.extractTenderId(result);

    return {
      type: 'result',
      title: this.resolveTenderTitle(result),
      status: String(result?.status || '').toLowerCase(),
      description: this.isWonResult(result)
        ? 'Contract awarded.'
        : 'Tender result published.',
      timestamp: result?.decision_date || result?.created_at || result?.updated_at || '',
      tenderId,
      routeLink: tenderId ? ['/result', tenderId] : '/result'
    };
  }

  private resolveTenderTitle(source: any) {
    const directTitle =
      source?.title ||
      source?.tender_title ||
      source?.tender?.title ||
      source?.tender?.name ||
      source?.name ||
      '';

    if (directTitle) {
      return directTitle;
    }

    const tenderId = this.extractTenderId(source);
    if (tenderId && this.tenders.length === 0 && this.myTenders.length === 0 && this.loading) {
       return 'Memuat judul tender...'; 
    }

    const matchedTender = [...this.myTenders, ...this.tenders].find((tender) =>
      Number(tender?.id) === Number(tenderId)
    );

    return matchedTender?.title || matchedTender?.name || `Tender #${tenderId}`;
  }

  private extractTenderId(source: any) {
    const candidate =
      source?.tender_id ||
      source?.tender?.id ||
      source?.id_tender ||
      null;

    const numericId = Number(candidate);

    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  }

  private isWonResult(result: any) {
    return String(result?.status || '').toLowerCase() === 'won';
  }

  private isActiveBid(bid: any) {
    const status = String(bid?.status || '').toLowerCase();

    if (!status) {
      return true;
    }

    return ![
      'won',
      'lost',
      'closed',
      'rejected',
      'finished',
      'cancelled',
      'canceled'
    ].includes(status);
  }

  private getActivityTimestampValue(activity: DashboardActivity) {
    const parsed = activity.timestamp ? new Date(activity.timestamp).getTime() : NaN;
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  }

  private formatDate(date: Date | null) {
    if (!date) {
      return '-';
    }

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}
