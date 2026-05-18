import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonBadge,
  IonButton
} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { TenderService } from 'src/app/services/tender.service';

@Component({
  selector: 'app-tender-list',
  templateUrl: './tender-list.page.html',
  styleUrls: ['./tender-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonContent,
    IonBadge,
    IonButton
  ]
})
export class TenderListPage implements OnInit {

  tenders: any[] = [];

  constructor(private tenderService: TenderService) {}

  ngOnInit() {
    this.tenders = this.tenderService.getTenders();
  }

}
