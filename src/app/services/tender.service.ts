import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TenderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTenders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor/tenders`);
  }

  getMyTenders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor/tenders/my-tenders`);
  }

  getTenderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor/tenders/${id}`);
  }

  getAanwijzing(tenderId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor/tenders/${tenderId}/announcements`);
  }

  submitAanwijzingQuestion(tenderId: number, data: any): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/vendor/tenders/${tenderId}/announcements/questions`,
      data
    );
  }

  joinTender(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vendor/tenders/${id}/join`, {});
  }
}
