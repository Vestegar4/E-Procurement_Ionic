import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VendorService {

  getProfile() {
    return {
      company_name: 'PT cenat cenut sejahtera',
      email: 'vendor@mail.com',
      address: 'Karawang tengah, Jawa Barat',
      contact: '081234567890',
      verification_status: 'approved'
    };
  }

  updateProfile(data: any) {
    console.log('Profile updated:', data);

    return {
      success: true,
      message: 'Profile berhasil diperbarui'
    };
  }
  uploadDocument(data: any) {
  console.log('Document uploaded:', data);

  return {
    success: true,
    message: 'Dokumen berhasil diupload'
  };
}

}