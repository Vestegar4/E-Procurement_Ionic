import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule,
    RouterModule,
    IonContent,
    IonBadge,
    IonButton
  ]
})
export class TenderListPage implements OnInit {

  tenders: any[] = [];
  searchQuery = '';
  activeCategory: 'all' | 'infrastructure' = 'all';

  loading = false;

  constructor(private tenderService: TenderService) {}

  ngOnInit() {
    this.loadTenders();
  }

  loadTenders() {
    this.loading = true;

    this.tenderService.getTenders().subscribe({
      next: (res: any) => {
        console.log('TENDERS RESPONSE:', res);

        this.tenders = Array.isArray(res)
          ? res
          : res.data || res.tenders || [];

        this.loading = false;
      },
      error: (err: any) => {
        console.log('TENDERS ERROR:', err);

        this.tenders = [];
        this.loading = false;
      }
    });
  }

  get filteredTenders() {
    return this.tenders.filter(tender => {
      const matchesCategory =
        this.activeCategory === 'all' || this.isInfrastructureTender(tender);

      const matchesSearch = this.matchesSearch(tender);

      return matchesCategory && matchesSearch;
    });
  }

  setCategory(category: 'all' | 'infrastructure') {
    this.activeCategory = category;
  }

  private matchesSearch(tender: any) {
    const query = this.searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const haystack = [
      tender.title,
      tender.name,
      tender.description,
      tender.status,
      tender.start_date,
      tender.end_date,
      tender.created_at
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  }

  private isInfrastructureTender(tender: any) {
    const text = [
      tender.title,
      tender.name,
      tender.description
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const infrastructureKeywords = [
      'internet',
      'network',
      'infrastruktur',
      'infrastructure',
      'cloud',
      'data',
      'digital',
      'server',
      'smart city',
      'it'
    ];

    return infrastructureKeywords.some(keyword => text.includes(keyword));
  }

}
