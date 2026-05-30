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
import { VendorService } from 'src/app/services/vendor.service';
import { AuthService } from 'src/app/services/auth.service';

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
  vendorStatus = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenderService: TenderService,
    private vendorService: VendorService,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadTender(id);
    this.loadVendorProfile();
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
    if (!this.authService.isVendorApproved({ verification_status: this.vendorStatus })) {
      this.showToast('Akun vendor masih menunggu approval admin.', 'danger');
      return;
    }

    if (!this.tender || this.tender.status !== 'open') {
      this.showToast('Tender tidak sedang open', 'danger');
      return;
    }

    this.tenderService.joinTender(this.tender.id).subscribe({
      next: (res: any) => {
        this.joined = true;
        this.showToast(res?.message || 'Berhasil mengikuti tender');
      },
      error: (err: any) => {
        console.log('JOIN TENDER ERROR:', err);
        this.showToast(err?.error?.message || 'Gagal mengikuti tender', 'danger');
      }
    });
  }

  goToBidding() {
    this.router.navigate(['/bidding', this.tender.id]);
  }

  goToResult() {
    this.router.navigate(['/result', this.tender.id]);
  }

  private loadTender(id: number) {
    this.tenderService.getTenderById(id).subscribe({
      next: (res: any) => {
        this.tender = this.extractTender(res);
        this.joined = !!(
          this.tender?.joined ||
          this.tender?.is_joined ||
          this.tender?.has_joined
        );
      },
      error: (err: any) => {
        console.log('TENDER DETAIL ERROR:', err);
        this.tender = null;
      }
    });
  }

  private loadVendorProfile() {
    this.vendorService.getProfile().subscribe({
      next: (res: any) => {
        const vendor = res?.vendor || res?.data?.vendor || res?.data || res;
        this.vendorStatus = this.authService.getVendorVerificationStatus(vendor);
      },
      error: (err: any) => {
        console.log('VENDOR PROFILE ERROR:', err);
        this.vendorStatus = this.authService.getVendorVerificationStatus();
      }
    });
  }

  private extractTender(res: any) {
    return res?.tender || res?.data?.tender || res?.data || res || null;
  }

}
