import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly tokenKey = 'vendor_token';
  private readonly vendorProfileKey = 'vendor_profile';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(data: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/auth/vendor/login`, data);
  }

  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/auth/vendor/register`, data);
  }

  me() {
    return this.http.get<any>(`${this.apiUrl}/auth/vendor/me`).pipe(
      tap((res) => this.persistVendorProfileFromResponse(res))
    );
  }

  logoutApi() {
    return this.http.post<any>(`${this.apiUrl}/auth/vendor/logout`, {});
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  saveVendorProfile(vendor: any) {
    if (!vendor || typeof vendor !== 'object') {
      return;
    }

    localStorage.setItem(this.vendorProfileKey, JSON.stringify(vendor));
  }

  persistSession(token: string, vendor?: any) {
    this.saveToken(token);

    if (vendor) {
      this.saveVendorProfile(vendor);
    }
  }

  persistVendorProfileFromResponse(res: any) {
    const vendor = this.extractVendor(res);

    if (vendor) {
      this.saveVendorProfile(vendor);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getStoredVendorProfile(): any | null {
    const rawProfile = localStorage.getItem(this.vendorProfileKey);

    if (!rawProfile) {
      return null;
    }

    try {
      return JSON.parse(rawProfile);
    } catch {
      localStorage.removeItem(this.vendorProfileKey);
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  extractToken(res: any): string {
    return String(
      res?.token ||
      res?.access_token ||
      res?.data?.token ||
      res?.data?.access_token ||
      ''
    ).trim();
  }

  extractVendor(res: any): any | null {
    const candidates = [
      res?.vendor,
      res?.user,
      res?.data?.vendor,
      res?.data?.user
    ];

    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        return candidate;
      }
    }

    const data = res?.data;

    if (
      data &&
      typeof data === 'object' &&
      !Array.isArray(data) &&
      !data.token &&
      !data.access_token
    ) {
      return data;
    }

    if (
      res &&
      typeof res === 'object' &&
      !Array.isArray(res) &&
      !res.token &&
      !res.access_token &&
      (
        res.company_name ||
        res.name ||
        res.email ||
        res.verification_status ||
        res.status
      )
    ) {
      return res;
    }

    return null;
  }

  normalizeVerificationStatus(status: any): string {
    return String(status || '').trim().toLowerCase();
  }

  getVendorVerificationStatus(vendor?: any): string {
    const profile = vendor || this.getStoredVendorProfile();
    return this.normalizeVerificationStatus(
      profile?.verification_status || profile?.status
    );
  }

  isVendorApproved(vendor?: any): boolean {
    return this.getVendorVerificationStatus(vendor) === 'approved';
  }

  formatVerificationStatus(vendor?: any, fallback: string = 'Not available'): string {
    const status = this.getVendorVerificationStatus(vendor);

    if (!status) {
      return fallback;
    }

    return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
  }

  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.vendorProfileKey);
  }

  logout() {
    this.clearSession();
    void this.router.navigate(['/login']);
  }
}
