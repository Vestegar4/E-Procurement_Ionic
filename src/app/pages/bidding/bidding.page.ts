import { Component, OnInit } from '@angular/core';
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
export class BiddingPage implements OnInit {

  tender: any;

  bidAmount = '';

  biddingActive = true;

  countdown = '';

  endTime = new Date().getTime() + 3600000;

  constructor(
    private route: ActivatedRoute,
    private tenderService: TenderService,
    private biddingService: BiddingService,
    private toastController: ToastController
  ) {}

  ngOnInit() {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.tender = this.tenderService.getTenderById(id);

    this.startCountdown();
  }

  startCountdown() {

    const interval = setInterval(() => {

      const now = new Date().getTime();

      const distance = this.endTime - now;

      if (distance <= 0) {

        clearInterval(interval);

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

    const result = this.biddingService.submitBid(data);

    if (result.success) {

      this.showToast(result.message);

      this.bidAmount = '';
    }

  }

}
