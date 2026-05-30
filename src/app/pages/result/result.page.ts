import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonBadge,
  IonButton
} from '@ionic/angular/standalone';

import { ActivatedRoute, RouterModule } from '@angular/router';
import { ResultService } from 'src/app/services/result.service';
import { TenderService } from 'src/app/services/tender.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonBadge,
    IonButton
  ]
})
export class ResultPage implements OnInit {

  tender: any;
  result: any;

  constructor(
    private route: ActivatedRoute,
    private tenderService: TenderService,
    private resultService: ResultService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.tenderService.getTenderById(id).subscribe({
      next: (res: any) => {
        this.tender = res?.tender || res?.data?.tender || res?.data || res || null;
      },
      error: (err: any) => {
        console.log('RESULT TENDER ERROR:', err);
        this.tender = null;
      }
    });

    this.resultService.getResultByTenderId(id).subscribe({
      next: (res: any) => {
        this.result = res?.result || res?.data?.result || res?.data || res || null;
      },
      error: (err: any) => {
        console.log('RESULT DETAIL ERROR:', err);
        this.result = null;
      }
    });
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(Number(value || 0));
  }

}
