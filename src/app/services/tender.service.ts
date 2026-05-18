import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TenderService {

  getTenders() {
    return [
      {
        id: 1,
        title: 'Pengadaan 100 Laptop',
        description: 'Tender pengadaan laptop untuk kebutuhan kantor.',
        status: 'open',
        start_date: '2026-05-18',
        end_date: '2026-05-25'
      },
      {
        id: 2,
        title: 'Jasa Internet Kantor',
        description: 'Pengadaan layanan internet bulanan.',
        status: 'bidding',
        start_date: '2026-05-18',
        end_date: '2026-05-22'
      },
      {
        id: 3,
        title: 'Pengadaan Meja Kantor',
        description: 'Pengadaan meja kerja untuk ruang admin.',
        status: 'closed',
        start_date: '2026-05-10',
        end_date: '2026-05-15'
      }
      
    ];
  }
  getTenderById(id: number) {
  return this.getTenders().find(tender => tender.id === id);
}

joinTender(id: number) {
  return {
    success: true,
    message: 'Berhasil mengikuti tender'
  };
}

}