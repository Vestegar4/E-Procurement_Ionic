import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BiddingService {

  submitBid(data: any) {

    console.log('Bid Submitted:', data);

    return {
      success: true,
      message: 'Bidding berhasil dikirim'
    };
  }

}