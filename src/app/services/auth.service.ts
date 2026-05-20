import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'vendor_token';

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
    return this.http.get<any>(`${this.apiUrl}/auth/vendor/me`);
  }

  logoutApi() {
    return this.http.post<any>(`${this.apiUrl}/auth/vendor/logout`, {});
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }
}
