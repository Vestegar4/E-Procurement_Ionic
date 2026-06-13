import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonBadge
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
    IonBadge
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

        this.tenders = (res?.data?.data ?? []).map((tender: any) => ({
          ...tender,
          title: tender?.title || tender?.name || '-',
          description: tender?.description || tender?.summary || '-',
          status: tender?.effective_status || tender?.status || '-',
          status_key: String(tender?.effective_status || tender?.status || '')
            .toLowerCase()
            .trim()
        }));

        console.log('TENDERS ARRAY:', this.tenders);
        console.log('TENDER COUNT:', this.tenders.length);

        this.loading = false;
      },
      error: (err: any) => {
        console.log('TENDERS ERROR:', err);
        this.tenders = [];
        this.loading = false;
      }
    });
  }

  get featuredTender() {
    return this.filteredTenders.length ? this.filteredTenders[0] : null;
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

  getDisplayValue(value: any, fallback: string = '-') {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }

    return String(value);
  }

  getBudgetValue(tender: any) {
    const value =
      tender?.budget ||
      tender?.estimated_budget ||
      tender?.est_budget ||
      tender?.price ||
      tender?.project_value ||
      tender?.value;

    if (!value) {
      return '-';
    }

    const numberValue = Number(String(value).replace(/[^0-9.-]/g, ''));

    if (!Number.isFinite(numberValue) || numberValue <= 0) {
      return '-';
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(numberValue);
  }

  getClosingDateValue(tender: any) {
    const rawDate =
      tender?.timeline?.bidding_end ||
      tender?.timeline?.registration_end ||
      tender?.closing_date ||
      tender?.end_date ||
      tender?.deadline ||
      tender?.created_at;

    if (!rawDate) {
      return '-';
    }

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
      tender.effective_status,
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
      'it',
      'mbg',
      'dapur'
    ];

    return infrastructureKeywords.some(keyword => text.includes(keyword));
  }
}
