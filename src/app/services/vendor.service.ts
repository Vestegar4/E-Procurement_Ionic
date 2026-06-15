import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getProfile() {
    return this.http.get<any>(`${this.apiUrl}/auth/vendor/me`).pipe(
      tap((res) => this.authService.persistVendorProfileFromResponse(res))
    );
  }

  updateProfile(data: any) {
    return this.http.put<any>(`${this.apiUrl}/vendor/profile`, data);
  }

  uploadDocument(data: any) {
    const formData = new FormData();

    Object.entries(data || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as Blob | string);
      }
    });

    return this.http.post<any>(`${this.apiUrl}/vendor/documents`, formData);
  }
}
