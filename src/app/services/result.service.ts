import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ResultService {

  getResultByTenderId(tenderId: number) {
    return {
      tender_id: tenderId,
      status: 'won',
      winner_vendor: 'PT cenat cenut sejahtera',
      winning_bid: 470000000,
      decision_date: '2026-05-18',
      note: 'Vendor dipilih berdasarkan harga terbaik dan dokumen lengkap.'
    };
  }

}