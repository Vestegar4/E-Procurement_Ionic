import { Component, OnInit } from '@angular/core';
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
export class DocumentsPage implements OnInit {

  documentType = '';
  selectedFile: File | null = null;

  uploadedDocuments: any[] = [];

  constructor(
    private vendorService: VendorService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

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

    this.vendorService.uploadDocument(data).subscribe({
      next: (res: any) => {
        const uploadedDocument = this.extractUploadedDocument(res);

        if (uploadedDocument) {
          this.uploadedDocuments = [uploadedDocument, ...this.uploadedDocuments];
        } else {
          this.loadDocuments();
        }

        this.documentType = '';
        this.selectedFile = null;

        this.showToast(res?.message || 'Dokumen berhasil diupload');
      },
      error: (err: any) => {
        console.log('UPLOAD DOCUMENT ERROR:', err);
        this.showToast(err?.error?.message || 'Gagal upload dokumen', 'danger');
      }
    });
  }

  private loadDocuments() {
    this.vendorService.getProfile().subscribe({
      next: (res: any) => {
        const vendor = res?.vendor || res?.data?.vendor || res?.data || res || {};
        const documents =
          vendor?.documents ||
          res?.documents ||
          res?.data?.documents ||
          [];

        this.uploadedDocuments = Array.isArray(documents)
          ? documents.map((doc: any) => ({
              type: doc?.type || doc?.document_type || 'Dokumen',
              filename: doc?.filename || doc?.name || doc?.file_name || '-',
              status: doc?.status || 'uploaded'
            }))
          : [];
      },
      error: (err: any) => {
        console.log('LOAD DOCUMENTS ERROR:', err);
        this.uploadedDocuments = [];
      }
    });
  }

  private extractUploadedDocument(res: any) {
    const document =
      res?.document ||
      res?.data?.document ||
      res?.data ||
      null;

    if (!document) {
      return null;
    }

    return {
      type: document?.type || document?.document_type || this.documentType,
      filename: document?.filename || document?.name || document?.file_name || this.selectedFile?.name || '-',
      status: document?.status || 'uploaded'
    };
  }

}
