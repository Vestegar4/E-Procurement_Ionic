import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonInput,
  IonButton,
  IonBadge,
  ToastController
} from '@ionic/angular/standalone';

import { ActivatedRoute, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { TenderService } from 'src/app/services/tender.service';
import { BiddingService } from 'src/app/services/bidding.service';

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
    IonInput,
    IonButton,
    IonBadge
  ]
})
export class BiddingPage implements OnInit, OnDestroy {

  tender: any = null;

  bidAmount = '';

  biddingActive = true;

  countdown = '';

  endTime = 0;

  currentLowestBid = 'Rp0';

  activeBidCount = 0;

  minimumDecrement = 'Rp0';

  activityFeed: any[] = [];
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private route: ActivatedRoute,
    private tenderService: TenderService,
    private biddingService: BiddingService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadTender(id);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  startCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {

      const now = new Date().getTime();

      const distance = this.endTime - now;

      if (distance <= 0) {

        if (this.countdownInterval) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
        }

        this.biddingActive = false;

        this.countdown = 'Bidding Ditutup';

        return;
      }

      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) /
        (1000 * 60)
      );

      const seconds = Math.floor(
        (distance % (1000 * 60)) / 1000
      );

      this.countdown =
        `${hours}h ${minutes}m ${seconds}s`;

    }, 1000);

  }

  async showToast(message: string, color: string = 'success') {

    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });

    await toast.present();

  }

  submitBid() {

    if (!this.tender) {

      this.showToast('Tender tidak ditemukan', 'danger');

      return;
    }

    if (!this.biddingActive) {

      this.showToast('Bidding sudah ditutup', 'danger');

      return;
    }

    if (!this.bidAmount) {

      this.showToast('Masukkan harga bidding', 'danger');

      return;
    }

    const data = {
      tender_id: this.tender.id,
      amount: this.bidAmount
    };

    this.biddingService.submitBid(this.tender.id, data).subscribe({
      next: (res: any) => {
        this.showToast(res?.message || 'Bid berhasil dikirim');
        this.bidAmount = '';
        this.loadBidData(this.tender);
      },
      error: (err: any) => {
        console.log('SUBMIT BID ERROR:', err);
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

  private getCountdownParts() {
    if (!this.biddingActive || !this.countdown) {
      return {
        hours: '00',
        minutes: '00',
        seconds: '00'
      };
    }

    const match = this.countdown.match(/(\d+)h\s+(\d+)m\s+(\d+)s/);

    if (!match) {
      return {
        hours: '00',
        minutes: '00',
        seconds: '00'
      };
    }

    return {
      hours: match[1].padStart(2, '0'),
      minutes: match[2].padStart(2, '0'),
      seconds: match[3].padStart(2, '0')
    };
  }

  private loadTender(id: number) {
    this.tenderService.getTenderById(id).subscribe({
      next: (res: any) => {
        this.tender = res?.tender || res?.data?.tender || res?.data || res || null;

        if (!this.tender) {
          return;
        }

        this.endTime = this.resolveEndTime(this.tender);
        this.biddingActive = this.resolveBiddingActive(this.tender);
        this.minimumDecrement = this.formatCurrency(
          this.tender?.minimum_decrement ||
          this.tender?.minimum_bid_decrement ||
          this.tender?.bid_decrement ||
          0
        );

        this.loadBidData(this.tender);

        if (this.biddingActive && this.endTime > Date.now()) {
          this.startCountdown();
        } else if (!this.biddingActive) {
          this.countdown = 'Bidding Ditutup';
        }
      },
      error: (err: any) => {
        console.log('BIDDING TENDER ERROR:', err);
        this.tender = null;
        this.activityFeed = [];
      }
    });
  }

  private loadBidData(tender: any) {
    const tenderBids = this.extractBidList(tender);

    if (tenderBids.length) {
      this.applyBidData(tenderBids);
      return;
    }

    this.biddingService.getMyBids().subscribe({
      next: (res: any) => {
        const bids = this.extractBidList(res).filter((bid: any) => {
          const tenderId = bid?.tender_id || bid?.tender?.id;
          return Number(tenderId) === Number(tender?.id);
        });

        this.applyBidData(bids);
      },
      error: (err: any) => {
        console.log('LOAD BIDS ERROR:', err);
        this.applyBidData([]);
      }
    });
  }

  private applyBidData(bids: any[]) {
    const amounts = bids
      .map((bid: any) => Number(bid?.amount || bid?.bid_amount || bid?.value || 0))
      .filter((amount: number) => Number.isFinite(amount) && amount > 0);

    const lowestBid = amounts.length ? Math.min(...amounts) : 0;

    this.currentLowestBid = this.formatCurrency(lowestBid);
    this.activeBidCount = bids.length;
    this.activityFeed = bids.slice(0, 10).map((bid: any, index: number) => ({
      bidder:
        bid?.vendor_name ||
        bid?.vendor?.company_name ||
        bid?.vendor?.name ||
        `Bidder #${String(index + 1).padStart(4, '0')}`,
      time: bid?.created_at || bid?.updated_at || '-',
      amount: this.formatCurrency(
        Number(bid?.amount || bid?.bid_amount || bid?.value || 0)
      ),
      status: bid?.status || 'Submitted'
    }));
  }

  private extractBidList(source: any) {
    if (Array.isArray(source)) {
      return source;
    }

    if (Array.isArray(source?.bids)) {
      return source.bids;
    }

    if (Array.isArray(source?.data?.bids)) {
      return source.data.bids;
    }

    if (Array.isArray(source?.data)) {
      return source.data;
    }

    return [];
  }

  private resolveEndTime(tender: any) {
    const rawDate = tender?.end_date || tender?.closing_date || tender?.deadline;
    const parsedDate = rawDate ? new Date(rawDate).getTime() : NaN;

    if (Number.isFinite(parsedDate) && parsedDate > 0) {
      return parsedDate;
    }

    return new Date().getTime();
  }

  private resolveBiddingActive(tender: any) {
    const status = String(tender?.status || '').toLowerCase();

    if (status) {
      return status === 'open' || status === 'bidding';
    }

    return true;
  }

  private formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(Number.isFinite(value) ? value : 0);
  }

}
