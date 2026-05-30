import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TenderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTenders() {
    return this.http.get<any>(`${this.apiUrl}/vendor/tenders`);
  }

  getMyTenders() {
    return this.http.get<any>(`${this.apiUrl}/vendor/tenders/my-tenders`);
  }

  getTenderById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/vendor/tenders/${id}`);
  }

  joinTender(id: number) {
    return this.http.post<any>(`${this.apiUrl}/vendor/tenders/${id}/join`, {});
  }
}