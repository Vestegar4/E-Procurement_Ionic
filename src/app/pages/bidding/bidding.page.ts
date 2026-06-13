import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton,
  ToastController
} from '@ionic/angular/standalone';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TenderService } from 'src/app/services/tender.service';
import { BiddingService } from 'src/app/services/bidding.service';
import { VendorService } from 'src/app/services/vendor.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-bidding',
  templateUrl: './bidding.page.html',
  styleUrls: ['./bidding.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonButton
  ]
})
export class BiddingPage implements OnInit, OnDestroy {
  tender: any = null;
  bidAmount = '';
  selectedFile: File | null = null;

  biddingActive = false;
  countdown = '00h 00m 00s';
  endTime = 0;

  currentLowestBid = '-';
  activeBidCount = 0;
  minimumDecrement = this.formatCurrency(0);
  activityFeed: any[] = [];

  vendorStatus = '';
  biddingTermsText = 'Informasi ketentuan bidding belum tersedia.';

  loading = true;
  loadingBids = false;
  submitting = false;
  pageError = '';

  private tenderId = 0;
  private latestBidSnapshot: any[] = [];
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private tenderService: TenderService,
    private biddingService: BiddingService,
    private vendorService: VendorService,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadVendorProfile();

    if (!Number.isFinite(id) || id <= 0) {
      this.pageError = 'ID tender tidak valid.';
      this.biddingActive = false;
      this.loading = false;
      return;
    }

    this.tenderId = id;
    this.refreshBiddingData();
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });

    await toast.present();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.selectedFile = file || null;

    if (this.selectedFile) {
      console.log('BID DOCUMENT:', this.selectedFile.name);
    }
  }

  submitBid() {
    if (!this.authService.isVendorApproved({ verification_status: this.vendorStatus })) {
      this.showToast('Akun vendor belum approved untuk melakukan bidding.', 'danger');
      return;
    }

    if (!this.tender) {
      this.showToast('Tender tidak ditemukan', 'danger');
      return;
    }

    if (!this.biddingActive) {
      this.showToast('Bidding sudah ditutup', 'danger');
      return;
    }

    const amount = this.normalizeNumericValue(this.bidAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      this.showToast('Masukkan harga bidding', 'danger');
      return;
    }

    if (!this.selectedFile) {
      this.showToast('Dokumen bid wajib diunggah', 'danger');
      return;
    }

    const formData = new FormData();
    formData.append('bid_amount', String(amount));
    formData.append('amount', String(amount));
    formData.append('bid_document', this.selectedFile);

    this.submitting = true;

    this.biddingService.submitBid(this.tender.id, formData).subscribe({
      next: (res: any) => {
        console.log('SUBMIT BID RESPONSE:', res);

        this.submitting = false;
        this.showToast(res?.message || 'Bid berhasil dikirim', 'success');

        this.bidAmount = '';
        this.selectedFile = null;

        this.refreshBiddingData();
      },
      error: (err: any) => {
        console.log('SUBMIT BID ERROR:', err);

        this.submitting = false;
        this.showToast(err?.error?.message || 'Gagal mengirim bid', 'danger');
      }
    });
  }

  get countdownHours() {
    return this.getCountdownParts().hours;
  }

  get countdownMinutes() {
    return this.getCountdownParts().minutes;
  }

  get countdownSeconds() {
    return this.getCountdownParts().seconds;
  }

  private refreshBiddingData() {
    if (!this.tenderId) return;

    this.loadTender(this.tenderId);
    this.loadBidData(this.tenderId);
  }

  private loadTender(id: number) {
    this.loading = true;
    this.pageError = '';

    this.tenderService.getTenderById(id).subscribe({
      next: (res: any) => {
        console.log('BIDDING TENDER RESPONSE:', res);

        const rawTender = this.extractTender(res);
        this.tender = rawTender ? this.normalizeTender(rawTender) : null;

        if (!this.tender) {
          this.pageError = 'Data tender tidak ditemukan.';
          this.resetBiddingState();
          this.loading = false;
          return;
        }

        this.endTime = this.resolveEndTime(this.tender);

        this.minimumDecrement = this.formatCurrency(
          this.pickNumericValue(
            this.tender?.minimum_decrement,
            this.tender?.minimum_bid_decrement,
            this.tender?.bid_decrement
          )
        );

        this.biddingTermsText = this.resolveBiddingTerms(this.tender);
        this.updateBiddingAvailability();

        const embeddedBids = this.extractBidList(this.tender);
        const embeddedActivities = this.extractActivityList(this.tender);

        if (!this.latestBidSnapshot.length && (embeddedBids.length || embeddedActivities.length)) {
          this.applyBidData(embeddedBids, embeddedActivities);
        } else {
          this.syncBidSummary(this.latestBidSnapshot, embeddedActivities);
        }

        this.loading = false;
      },
      error: (err: any) => {
        console.log('BIDDING TENDER ERROR:', err);

        this.tender = null;
        this.pageError =
          err?.error?.message ||
          'Data tender untuk halaman bidding ini belum tersedia atau ID tender tidak valid.';

        this.resetBiddingState();
        this.loading = false;
      }
    });
  }

  private loadBidData(tenderId: number) {
    this.loadingBids = true;

    this.biddingService.getMyBids().subscribe({
      next: (res: any) => {
        console.log('BIDS RESPONSE:', res);

        const bids = this.extractBidList(res).filter((bid: any) => {
          const relatedTenderId = bid?.tender_id || bid?.tender?.id || bid?.tenderId;
          return Number(relatedTenderId) === Number(tenderId);
        });

        const activities = this.extractActivityList(res).filter((item: any) => {
          const relatedTenderId =
            item?.tender_id ||
            item?.tender?.id ||
            item?.bid?.tender_id ||
            item?.bid?.tender?.id;

          return !relatedTenderId || Number(relatedTenderId) === Number(tenderId);
        });

        this.applyBidData(bids, activities);
        this.loadingBids = false;
      },
      error: (err: any) => {
        console.log('LOAD BIDS ERROR:', err);

        const embeddedBids = this.extractBidList(this.tender);
        const embeddedActivities = this.extractActivityList(this.tender);

        this.applyBidData(embeddedBids, embeddedActivities);
        this.loadingBids = false;
      }
    });
  }

  private loadVendorProfile() {
    this.vendorService.getProfile().subscribe({
      next: (res: any) => {
        const vendor = res?.vendor || res?.data?.vendor || res?.data || res;
        this.vendorStatus = this.authService.getVendorVerificationStatus(vendor);
      },
      error: () => {
        this.vendorStatus = this.authService.getVendorVerificationStatus();
      }
    });
  }

  private applyBidData(bids: any[], activities: any[] = []) {
    this.latestBidSnapshot = bids;
    this.syncBidSummary(bids, activities);
  }

  private syncBidSummary(bids: any[], activities: any[] = []) {
    const lowestBidAmount = this.resolveLowestBidAmount(this.tender, bids);
    const activeBidCount = this.resolveActiveBidCount(this.tender, bids);
    const feedSource = activities.length ? activities : bids;

    this.currentLowestBid =
      lowestBidAmount > 0
        ? this.formatCurrency(lowestBidAmount)
        : this.resolveLowestBidLabelFromTender(this.tender);

    this.activeBidCount = activeBidCount;
    this.activityFeed = this.normalizeActivityFeed(feedSource);
  }

  private normalizeTender(rawTender: any) {
    return {
      ...rawTender,
      status_key: this.normalizeStatusKey(
        rawTender?.effective_status ||
        rawTender?.status ||
        rawTender?.state ||
        rawTender?.phase
      )
    };
  }

  private extractTender(res: any) {
    return res?.tender || res?.data?.tender || res?.data?.data || res?.data || res || null;
  }

  private extractBidList(source: any) {
    if (Array.isArray(source)) return source;
    if (Array.isArray(source?.bids)) return source.bids;
    if (Array.isArray(source?.data?.bids)) return source.data.bids;
    if (Array.isArray(source?.recent_bids)) return source.recent_bids;
    if (Array.isArray(source?.data?.data)) return source.data.data;
    if (Array.isArray(source?.data)) return source.data;
    if (source?.bid) return [source.bid];
    if (source?.data?.bid) return [source.data.bid];

    return [];
  }

  private extractActivityList(source: any) {
    if (Array.isArray(source?.activities)) return source.activities;
    if (Array.isArray(source?.data?.activities)) return source.data.activities;
    if (Array.isArray(source?.activity_feed)) return source.activity_feed;
    if (Array.isArray(source?.data?.activity_feed)) return source.data.activity_feed;
    if (Array.isArray(source?.recent_activities)) return source.recent_activities;
    if (Array.isArray(source?.data?.recent_activities)) return source.data.recent_activities;

    return [];
  }

  private normalizeActivityFeed(items: any[]) {
    return items
      .map((item: any, index: number) => {
        const amount = this.pickNumericValue(
          item?.amount,
          item?.bid_amount,
          item?.value,
          item?.price,
          item?.bid?.amount,
          item?.bid?.bid_amount
        );

        return {
          bidder: this.displayValue(
            item?.vendor_name ||
              item?.vendor?.company_name ||
              item?.vendor?.name ||
              item?.bidder_name ||
              item?.user?.name ||
              item?.title,
            amount > 0 ? `Bidder #${String(index + 1).padStart(4, '0')}` : '-'
          ),
          time: this.displayValue(
            item?.created_at ||
              item?.updated_at ||
              item?.submitted_at ||
              item?.time ||
              item?.timestamp,
            '-'
          ),
          amount: amount > 0 ? this.formatCurrency(amount) : '-',
          status: this.displayValue(item?.status || item?.state || item?.type || item?.label, '-')
        };
      })
      .filter((item: any) => item.bidder !== '-' || item.amount !== '-')
      .slice(0, 10);
  }

  private resolveEndTime(tender: any) {
    const rawDate =
      tender?.timeline?.bidding_end ||
      tender?.bidding_end ||
      tender?.end_date ||
      tender?.closing_date ||
      tender?.deadline ||
      tender?.bidding_deadline;

    const parsedDate = rawDate ? new Date(rawDate).getTime() : NaN;

    return Number.isFinite(parsedDate) ? parsedDate : 0;
  }

  private updateBiddingAvailability() {
    const statusAllowsBidding = this.resolveBiddingActive(this.tender);

    if (!statusAllowsBidding || !this.endTime || this.endTime <= Date.now()) {
      this.biddingActive = false;
      this.countdown = '00h 00m 00s';
      this.clearCountdown();
      return;
    }

    this.biddingActive = true;
    this.startCountdown();
  }

  private startCountdown() {
    this.clearCountdown();
    this.updateCountdownValue();

    if (!this.biddingActive) return;

    this.countdownInterval = setInterval(() => {
      this.updateCountdownValue();
    }, 1000);
  }

  private updateCountdownValue() {
    if (!this.endTime) {
      this.countdown = '00h 00m 00s';
      this.biddingActive = false;
      return;
    }

    const distance = this.endTime - Date.now();

    if (distance <= 0) {
      this.countdown = '00h 00m 00s';
      this.biddingActive = false;
      this.clearCountdown();
      return;
    }

    const totalSeconds = Math.floor(distance / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    this.countdown =
      `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  private clearCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private getCountdownParts() {
    const match = this.countdown.match(/(\d+)h\s+(\d+)m\s+(\d+)s/);

    if (!match) {
      return { hours: '00', minutes: '00', seconds: '00' };
    }

    return {
      hours: match[1].padStart(2, '0'),
      minutes: match[2].padStart(2, '0'),
      seconds: match[3].padStart(2, '0')
    };
  }

  private resolveBiddingActive(tender: any) {
    const status = this.normalizeStatusKey(
      tender?.effective_status ||
        tender?.status ||
        tender?.state ||
        tender?.phase
    );

    if (!status) return true;

    return ['open', 'bidding'].includes(status);
  }

  private resolveLowestBidAmount(tender: any, bids: any[]) {
    const tenderLowest = this.pickNumericValue(
      tender?.current_lowest_bid,
      tender?.lowest_bid,
      tender?.lowest_bid_amount,
      tender?.current_bid,
      tender?.current_price
    );

    if (tenderLowest > 0) return tenderLowest;

    const amounts = bids
      .map((bid: any) =>
        this.pickNumericValue(bid?.amount, bid?.bid_amount, bid?.value, bid?.price)
      )
      .filter((amount: number) => amount > 0);

    return amounts.length ? Math.min(...amounts) : 0;
  }

  private resolveLowestBidLabelFromTender(tender: any) {
    const fallbackAmount = this.pickNumericValue(
      tender?.current_lowest_bid,
      tender?.lowest_bid,
      tender?.lowest_bid_amount,
      tender?.current_bid,
      tender?.current_price
    );

    return fallbackAmount > 0 ? this.formatCurrency(fallbackAmount) : '-';
  }

  private resolveActiveBidCount(tender: any, bids: any[]) {
    const count = this.pickNumericValue(
      tender?.active_bid_count,
      tender?.active_bids,
      tender?.bid_count,
      tender?.total_bids,
      tender?.bids_count
    );

    return count > 0 ? count : bids.length;
  }

  private resolveBiddingTerms(tender: any) {
    return this.displayValue(
      tender?.bidding_terms ||
        tender?.terms_and_conditions ||
        tender?.terms ||
        tender?.contractual_terms ||
        tender?.notes ||
        tender?.description,
      'Informasi ketentuan bidding belum tersedia.'
    );
  }

  private resetBiddingState() {
    this.clearCountdown();
    this.endTime = 0;
    this.biddingActive = false;
    this.countdown = '00h 00m 00s';
    this.currentLowestBid = '-';
    this.activeBidCount = 0;
    this.minimumDecrement = this.formatCurrency(0);
    this.activityFeed = [];
    this.latestBidSnapshot = [];
    this.biddingTermsText = 'Informasi ketentuan bidding belum tersedia.';
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number.isFinite(value) ? value : 0);
  }

  private pickNumericValue(...values: any[]) {
    for (const value of values) {
      const numeric = this.normalizeNumericValue(value);

      if (Number.isFinite(numeric)) {
        return numeric;
      }
    }

    return 0;
  }

  private normalizeNumericValue(value: any) {
    if (value === undefined || value === null || value === '') return NaN;

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : NaN;
    }

    if (typeof value === 'string') {
      const normalized = value.replace(/[^0-9.-]/g, '');
      return normalized ? Number(normalized) : NaN;
    }

    return Number(value);
  }

  private displayValue(value: any, fallback: string) {
    if (value === undefined || value === null) return fallback;

    const text = String(value).trim();
    return text || fallback;
  }

  private normalizeStatusKey(value: any) {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');

    if (['open', 'active', 'published'].includes(normalized)) return 'open';
    if (['bidding', 'in_progress', 'ongoing', 'running'].includes(normalized)) return 'bidding';
    if (['closed', 'close', 'expired'].includes(normalized)) return 'closed';
    if (['finished', 'completed', 'done', 'awarded'].includes(normalized)) return 'finished';

    return normalized;
  }
}