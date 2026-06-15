import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Tambahkan ini
import { environment } from 'src/environments/environment'; // Tambahkan ini

@Injectable({
  providedIn: 'root'
})
export class TenderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTenders() {
    return this.http.get<any>(`${this.apiUrl}/vendor/tenders`);
  }

  getTenderById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/vendor/tenders/${id}`);
  }

  joinTender(id: number) {
    return this.http.post<any>(`${this.apiUrl}/vendor/tenders/${id}/join`, {});
  }
}