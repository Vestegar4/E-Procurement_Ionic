import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonBadge,
  IonButton,
  ToastController
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TenderService } from 'src/app/services/tender.service';

@Component({
  selector: 'app-tender-detail',
  templateUrl: './tender-detail.page.html',
  styleUrls: ['./tender-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonBadge,
    IonButton
  ]
})
export class TenderDetailPage implements OnInit {

  tender: any;
  joined = false;
  vendorStatus = 'approved';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenderService: TenderService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tender = this.tenderService.getTenderById(id);
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });

    await toast.present();
  }

  joinTender() {
    if (this.vendorStatus !== 'approved') {
      this.showToast('Vendor belum approved', 'danger');
      return;
    }

    if (this.tender.status !== 'open') {
      this.showToast('Tender tidak sedang open', 'danger');
      return;
    }

    const result = this.tenderService.joinTender(this.tender.id);

    if (result.success) {
      this.joined = true;
      this.showToast(result.message);
    }
  }

  goToBidding() {
    this.router.navigate(['/bidding', this.tender.id]);
  }

  goToResult() {
    this.router.navigate(['/result', this.tender.id]);
  }

}
