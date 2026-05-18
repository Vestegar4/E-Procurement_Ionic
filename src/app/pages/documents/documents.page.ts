import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonButton,
  IonSelect,
  IonSelectOption,
  ToastController
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendorService } from 'src/app/services/vendor.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.page.html',
  styleUrls: ['./documents.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonButton,
    IonSelect,
    IonSelectOption
  ]
})
export class DocumentsPage {

  documentType = '';
  selectedFile: File | null = null;

  uploadedDocuments = [
    {
      type: 'Legalitas',
      filename: 'akta_perusahaan.pdf',
      status: 'uploaded'
    },
    {
      type: 'Izin Usaha',
      filename: 'nib.pdf',
      status: 'uploaded'
    }
  ];

  constructor(
    private vendorService: VendorService,
    private toastController: ToastController
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });

    await toast.present();
  }

  uploadDocument() {
    if (!this.documentType) {
      this.showToast('Pilih jenis dokumen', 'danger');
      return;
    }

    if (!this.selectedFile) {
      this.showToast('Pilih file terlebih dahulu', 'danger');
      return;
    }

    const data = {
      type: this.documentType,
      file: this.selectedFile
    };

    const result = this.vendorService.uploadDocument(data);

    if (result.success) {
      this.uploadedDocuments.push({
        type: this.documentType,
        filename: this.selectedFile.name,
        status: 'uploaded'
      });

      this.documentType = '';
      this.selectedFile = null;

      this.showToast(result.message);
    }
  }

}