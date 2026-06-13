import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonBadge,
  IonTextarea,
  ToastController
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TenderService } from 'src/app/services/tender.service';
import { VendorService } from 'src/app/services/vendor.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-tender-detail',
  templateUrl: './tender-detail.page.html',
  styleUrls: ['./tender-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonContent,
    IonBadge,
    IonTextarea
  ]
})
export class TenderDetailPage implements OnInit {

  tender: any = null;
  joined = false;
  vendorStatus = '';
  loading = false;
  errorMessage = '';
  questionText = '';
  aanwijzingList: any[] = [];
  aanwijzingLoading = false;
  aanwijzingSubmitting = false;
  aanwijzingError = '';
  private tenderId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tenderService: TenderService,
    private vendorService: VendorService,
    private authService: AuthService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadVendorProfile();

    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage = 'ID tender tidak valid.';
      return;
    }

    this.tenderId = id;
    this.loadTender(id);
    this.loadAanwijzing(id);
  }

  async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });

    await toast.present();
  }

  joinTender() {
    if (!this.authService.isVendorApproved({ verification_status: this.vendorStatus })) {
      this.showToast('Akun vendor masih menunggu approval admin.', 'danger');
      return;
    }

    if (!this.tender || this.tender.status_key !== 'open') {
      this.showToast('Tender tidak sedang open', 'danger');
      return;
    }

    this.tenderService.joinTender(this.tender.id).subscribe({
      next: (res: any) => {
        this.joined = true;
        this.showToast(res?.message || 'Berhasil mengikuti tender');
      },
      error: (err: any) => {
        console.log('JOIN TENDER ERROR:', err);
        this.showToast(err?.error?.message || 'Gagal mengikuti tender', 'danger');
      }
    });
  }

  goToBidding() {
    this.router.navigate(['/bidding', this.tender.id]);
  }

  goToResult() {
    this.router.navigate(['/result', this.tender.id]);
  }

  submitAanwijzingQuestion() {
    if (!this.tenderId) {
      this.showToast('Tender tidak ditemukan', 'danger');
      return;
    }

    if (!this.authService.isVendorApproved({ verification_status: this.vendorStatus })) {
      this.showToast('Akun vendor masih menunggu approval admin.', 'danger');
      return;
    }

    const question = this.questionText.trim();

    if (!question) {
      this.showToast('Masukkan pertanyaan terlebih dahulu.', 'danger');
      return;
    }

    this.aanwijzingSubmitting = true;

    this.tenderService.submitAanwijzingQuestion(this.tenderId, { question }).subscribe({
      next: (res: any) => {
        this.aanwijzingSubmitting = false;
        this.questionText = '';
        this.showToast(res?.message || res?.data?.message || 'Pertanyaan berhasil dikirim');
        this.loadAanwijzing(this.tenderId);
      },
      error: (err: any) => {
        console.log('AANWIJZING SUBMIT ERROR:', err);
        this.aanwijzingSubmitting = false;
        this.showToast(err?.error?.message || 'Gagal mengirim pertanyaan', 'danger');
      }
    });
  }

  private loadTender(id: number) {
    this.loading = true;
    this.errorMessage = '';
    this.tender = null;
    this.joined = false;

    this.tenderService.getTenderById(id).subscribe({
      next: (res: any) => {
        const rawTender = this.extractTender(res);
        this.tender = rawTender ? this.normalizeTender(rawTender) : null;
        this.joined = !!(
          rawTender?.joined ||
          rawTender?.is_joined ||
          rawTender?.has_joined
        );

        if (!this.tender) {
          this.errorMessage = 'Data tender tidak ditemukan.';
        }

        this.loading = false;
      },
      error: (err: any) => {
        console.log('TENDER DETAIL ERROR:', err);
        this.tender = null;
        this.errorMessage =
          err?.error?.message ||
          'Gagal memuat detail tender. Silakan coba lagi.';
        this.loading = false;
      }
    });
  }

  private loadVendorProfile() {
    this.vendorService.getProfile().subscribe({
      next: (res: any) => {
        const vendor = res?.vendor || res?.data?.vendor || res?.data || res;
        this.vendorStatus = this.authService.getVendorVerificationStatus(vendor);
      },
      error: (err: any) => {
        console.log('VENDOR PROFILE ERROR:', err);
        this.vendorStatus = this.authService.getVendorVerificationStatus();
      }
    });
  }

  private loadAanwijzing(tenderId: number) {
    this.aanwijzingLoading = true;
    this.aanwijzingError = '';

    this.tenderService.getAanwijzing(tenderId).subscribe({
      next: (res: any) => {
        const rawItems = this.extractAanwijzingList(res);
        this.aanwijzingList = rawItems
          .map((item: any) => this.normalizeAanwijzingItem(item))
          .filter((item: any) => !!item);
        this.aanwijzingLoading = false;
      },
      error: (err: any) => {
        console.log('AANWIJZING ERROR:', err);
        this.aanwijzingList = [];
        this.aanwijzingError =
          err?.error?.message ||
          'Gagal memuat data aanwijzing. Silakan coba lagi.';
        this.aanwijzingLoading = false;
      }
    });
  }

  private extractTender(res: any) {
    return (
      res?.tender ||
      res?.data?.tender ||
      res?.data?.data ||
      res?.data ||
      res ||
      null
    );
  }

  private extractAanwijzingList(res: any) {
    if (Array.isArray(res)) {
      return res;
    }

    if (Array.isArray(res?.announcements)) {
      return res.announcements;
    }

    if (Array.isArray(res?.questions)) {
      return res.questions;
    }

    if (Array.isArray(res?.data?.announcements)) {
      return res.data.announcements;
    }

    if (Array.isArray(res?.data?.questions)) {
      return res.data.questions;
    }

    if (Array.isArray(res?.data?.data)) {
      return res.data.data;
    }

    if (Array.isArray(res?.data)) {
      return res.data;
    }

    if (res?.announcement) {
      return [res.announcement];
    }

    if (res?.question) {
      return [res.question];
    }

    if (res?.data?.announcement) {
      return [res.data.announcement];
    }

    if (res?.data?.question) {
      return [res.data.question];
    }

    return [];
  }

  private normalizeTender(rawTender: any) {
    const status = this.pickFirst(
      rawTender?.status,
      rawTender?.effective_status,
      rawTender?.state,
      rawTender?.phase
    );

    const budgetValue = this.pickFirst(
      rawTender?.budget,
      rawTender?.estimated_budget,
      rawTender?.budget_value,
      rawTender?.project_value,
      rawTender?.value
    );

    const durationValue = this.pickFirst(
      rawTender?.duration,
      rawTender?.project_duration,
      rawTender?.contract_duration,
      rawTender?.duration_label,
      rawTender?.period
    );

    return {
      ...rawTender,
      title: this.displayValue(
        this.pickFirst(rawTender?.title, rawTender?.name),
        'Not available'
      ),
      description: this.displayValue(
        this.pickFirst(
          rawTender?.description,
          rawTender?.summary,
          rawTender?.details,
          rawTender?.notes
        ),
        'Not available'
      ),
      reference_number: this.displayValue(
        this.pickFirst(
          rawTender?.reference_number,
          rawTender?.reference_no,
          rawTender?.code
        ),
        rawTender?.id ? `#${rawTender.id}` : 'Not available'
      ),
      status: this.displayValue(status, 'Not available'),
      status_key: this.normalizeStatusKey(status),
      budget: this.formatBudget(budgetValue),
      duration: this.formatDuration(durationValue, rawTender),
      requirements: this.extractRequirements(rawTender),
      timeline: this.extractTimeline(rawTender),
      project_site: this.displayValue(
        this.pickFirst(
          rawTender?.project_site,
          rawTender?.site_name,
          rawTender?.location,
          rawTender?.address,
          rawTender?.project_location
        ),
        'Not available'
      )
    };
  }

  private normalizeAanwijzingItem(item: any) {
    if (!item || typeof item !== 'object') {
      return null;
    }

    const question = this.displayValue(
      this.pickFirst(
        item?.question,
        item?.question_text,
        item?.title,
        item?.content,
        item?.body,
        item?.message
      ),
      ''
    );

    if (!question) {
      return null;
    }

    const answer = this.displayValue(
      this.pickFirst(
        item?.answer,
        item?.admin_answer,
        item?.reply,
        item?.response,
        item?.admin_reply,
        item?.announcement_answer
      ),
      ''
    );

    const createdAt = this.displayValue(
      this.pickFirst(
        item?.created_at,
        item?.question_date,
        item?.asked_at,
        item?.updated_at
      ),
      '-'
    );

    const vendorName = this.displayValue(
      this.pickFirst(
        item?.vendor_name,
        item?.vendor?.company_name,
        item?.vendor?.name,
        item?.user?.name
      ),
      'Vendor'
    );

    const status = answer
      ? this.displayValue(
          this.pickFirst(item?.status, item?.state, item?.label_status),
          'Answered'
        )
      : 'Pending';

    return {
      ...item,
      question,
      answer,
      createdAt,
      vendorName,
      status,
      stepClass: answer ? 'detail-step--completed' : 'detail-step--upcoming'
    };
  }

  private extractRequirements(rawTender: any) {
    const requirementSource = this.pickFirstArray(
      rawTender?.requirements,
      rawTender?.requirements?.data,
      rawTender?.requirement_items,
      rawTender?.criteria,
      rawTender?.qualifications,
      rawTender?.eligibility_requirements
    );

    return requirementSource
      .map((item: any) => this.normalizeRequirement(item))
      .filter((item: string) => !!item);
  }

  private extractTimeline(rawTender: any) {
    const timelineSource = this.pickFirstArray(
      rawTender?.timeline,
      rawTender?.timeline?.data,
      rawTender?.timelines,
      rawTender?.timeline_items,
      rawTender?.events,
      rawTender?.milestones,
      rawTender?.stages,
      rawTender?.activity_timeline
    );

    return timelineSource
      .map((item: any) => this.normalizeTimelineItem(item))
      .filter((item: any) => !!item);
  }

  private normalizeRequirement(item: any) {
    if (typeof item === 'string') {
      return item.trim();
    }

    if (!item || typeof item !== 'object') {
      return '';
    }

    return this.displayValue(
      this.pickFirst(
        item?.title,
        item?.name,
        item?.label,
        item?.text,
        item?.description,
        item?.requirement
      ),
      ''
    );
  }

  private normalizeTimelineItem(item: any) {
    if (typeof item === 'string') {
      const text = item.trim();

      return text
        ? {
            title: text,
            description: '',
            status: '',
            date: '',
            stepClass: 'detail-step--upcoming'
          }
        : null;
    }

    if (!item || typeof item !== 'object') {
      return null;
    }

    const title = this.displayValue(
      this.pickFirst(
        item?.title,
        item?.name,
        item?.label,
        item?.phase,
        item?.stage
      ),
      ''
    );

    const description = this.displayValue(
      this.pickFirst(
        item?.description,
        item?.details,
        item?.summary,
        item?.note,
        item?.activity
      ),
      ''
    );

    const status = this.displayValue(
      this.pickFirst(
        item?.status,
        item?.state,
        item?.progress_status,
        item?.label_status
      ),
      ''
    );

    const date = this.displayValue(
      this.pickFirst(
        item?.date,
        item?.datetime,
        item?.scheduled_at,
        item?.start_date,
        item?.end_date,
        item?.deadline,
        item?.time
      ),
      ''
    );

    if (!title && !description && !status && !date) {
      return null;
    }

    return {
      ...item,
      title: title || '-',
      description,
      status,
      date,
      stepClass: this.resolveTimelineStepClass(status)
    };
  }

  private resolveTimelineStepClass(status: any) {
    const normalizedStatus = String(status || '').trim().toLowerCase();

    if (
      normalizedStatus.includes('complete') ||
      normalizedStatus.includes('done') ||
      normalizedStatus.includes('finish') ||
      normalizedStatus.includes('closed')
    ) {
      return 'detail-step--completed';
    }

    if (
      normalizedStatus.includes('progress') ||
      normalizedStatus.includes('active') ||
      normalizedStatus.includes('open') ||
      normalizedStatus.includes('ongoing') ||
      normalizedStatus.includes('running')
    ) {
      return 'detail-step--active';
    }

    return 'detail-step--upcoming';
  }

  private formatBudget(value: any) {
    const amount = typeof value === 'string'
      ? Number(value.replace(/[^0-9.-]/g, ''))
      : Number(value);

    if (Number.isFinite(amount) && amount > 0) {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
      }).format(amount);
    }

    return this.displayValue(value, 'Not available');
  }

  private formatDuration(value: any, rawTender?: any) {
    if (value === undefined || value === null) {
      return 'Not available';
    }

    const unit = this.displayValue(
      this.pickFirst(
        rawTender?.duration_unit,
        rawTender?.duration_type,
        rawTender?.period_unit
      ),
      ''
    );

    if (typeof value === 'number' && Number.isFinite(value)) {
      return unit ? `${value} ${unit}` : `${value}`;
    }

    const text = String(value).trim();
    return text || 'Not available';
  }

  private displayValue(value: any, fallback: string) {
    if (value === undefined || value === null) {
      return fallback;
    }

    const text = String(value).trim();
    return text || fallback;
  }

  private pickFirst(...values: any[]) {
    return values.find((value: any) => {
      if (value === undefined || value === null) {
        return false;
      }

      if (typeof value === 'string') {
        return value.trim().length > 0;
      }

      return true;
    });
  }

  private pickFirstArray(...values: any[]) {
    return values.find((value: any) => Array.isArray(value)) || [];
  }

  private normalizeStatusKey(value: any) {
    const normalized = String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');

    if (['open', 'active', 'published'].includes(normalized)) {
      return 'open';
    }

    if (['bidding', 'in_progress', 'ongoing', 'running'].includes(normalized)) {
      return 'bidding';
    }

    if (['closed', 'close', 'expired'].includes(normalized)) {
      return 'closed';
    }

    if (['finished', 'completed', 'done', 'awarded'].includes(normalized)) {
      return 'finished';
    }

    return normalized;
  }

}
