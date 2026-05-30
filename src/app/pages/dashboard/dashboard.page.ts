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
        this.vendor = null;
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

  logout() {
    this.authService.logout();
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
      : '';
  }

  get latestWonResultLink() {
    const latestWon = this.results.find((result) => this.isWonResult(result));
    const tenderId = this.extractTenderId(latestWon);

    return tenderId ? ['/result', tenderId] : '/result';
  }

  formatStatCount(value: number) {
    return String(value || 0).padStart(2, '0');
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

  private completeLoad() {
    this.pendingLoads = Math.max(this.pendingLoads - 1, 0);
    this.loading = this.pendingLoads > 0;
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
    const matchedTender = [...this.myTenders, ...this.tenders].find((tender) =>
      Number(tender?.id) === Number(tenderId)
    );

    return matchedTender?.title || matchedTender?.name || '';
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
}
