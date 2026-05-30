import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getResults() {
    return this.http.get<any>(`${this.apiUrl}/vendor/results`);
  }

  getResultByTenderId(tenderId: number) {
    return this.http.get<any>(`${this.apiUrl}/vendor/results/${tenderId}`);
  }
}
