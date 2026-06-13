import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BiddingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyBids(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor/bids`);
  }

  getBidById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendor/bids/${id}`);
  }

  submitBid(tenderId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vendor/tenders/${tenderId}/bid`, data);
  }
}
