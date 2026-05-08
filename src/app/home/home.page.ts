import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage implements OnInit{
  vendor:any[] = []
  constructor(private ApiService:ApiService) {}

  async ngOnInit() {
    this.vendor = await this.ApiService.getVendors();
    console.log("hasil dari laravel:", this.vendor);
  }
}
