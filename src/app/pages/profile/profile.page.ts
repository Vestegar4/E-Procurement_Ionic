import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonInput,
  IonButton,
  IonBadge,
  ToastController
} from '@ionic/angular/standalone';

import { RouterModule } from '@angular/router';
import { VendorService } from 'src/app/services/vendor.service';

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
    IonBadge
  ]
})
export class ProfilePage implements OnInit {

  vendor: any = {
    company_name: '',
    email: '',
    address: '',
    contact: '',
    verification_status: ''
  };

  constructor(
    private vendorService: VendorService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.vendor = this.vendorService.getProfile();
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
    const result = this.vendorService.updateProfile(this.vendor);

    if (result.success) {
      this.showToast(result.message);
    }
  }

}
