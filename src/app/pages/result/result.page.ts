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

    this.tender = this.tenderService.getTenderById(id);
    this.result = this.resultService.getResultByTenderId(id);
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(value);
  }

}
