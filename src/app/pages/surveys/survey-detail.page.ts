import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SurveyApiService } from '../../services/survey-api.service';
import { SurveyAnalyticsDto, SurveyDetail, SurveyResponseCreateDto } from '../../models/survey.model';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { ResponseFormComponent } from '../../components/response-form/response-form.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-survey-detail-page',
  imports: [CommonModule, RouterLink, StatusBadgeComponent, ResponseFormComponent, LoadingOverlayComponent, DatePipe],
  template: `
    <section class="card" style="position: relative;">
      <app-loading-overlay [visible]="loading()" label="Loading survey" />

      @if (detail()) {
        <header class="row">
          <div>
            <p class="eyebrow">Survey</p>
            <h2 class="title">{{ detail()?.title }}</h2>
            <p class="muted">{{ detail()?.description }}</p>
            <p class="muted">Created {{ detail()?.createdAtUtc | date:'medium' }}</p>
          </div>
          <div class="actions">
            <app-status-badge [status]="detail()!.status" />
            <div class="action-group">
              @if (detail()?.status === 'Draft') {
                <button class="btn ghost" (click)="publish()">Publish</button>
              }
              @if (detail()?.status === 'Published') {
                <button class="btn ghost" (click)="close()">Close</button>
              }
              <button class="btn ghost" (click)="delete()">Delete</button>
            </div>
          </div>
        </header>

        <section class="grid-auto-fill">
          <div class="card">
            <p class="eyebrow">Questions</p>
            <ol class="questions">
              @for (q of detail()?.questions ?? []; track q.id) {
                <li>
                  <p class="name">{{ q.text }} <span class="muted">({{ q.type }})</span></p>
                  @if (q.type === 'SingleChoice') {
                    <ul class="muted">
                      @for (opt of q.options; track opt.id) {
                        <li>{{ opt.text }}</li>
                      }
                    </ul>
                  }
                </li>
              }
            </ol>
          </div>

          <div class="card">
            <p class="eyebrow">Analytics</p>
            @if (analytics()) {
              <p class="muted">Total responses: {{ analytics()?.totalResponses }}</p>
              @for (q of analytics()?.questions ?? []; track q.questionId) {
                <div class="bar-block">
                  <p class="name">{{ q.text }}</p>
                  @if (q.type === 'SingleChoice') {
                    @for (opt of q.options; track opt.optionId) {
                      <div class="bar-row">
                        <span>{{ opt.text }}</span>
                        <div class="bar">
                          <span class="fill" [style.width.%]="barWidth(opt.count, q.responseCount)"></span>
                        </div>
                        <span class="muted">{{ opt.count }}</span>
                      </div>
                    }
                  }
                </div>
              }
            }
            @if (!analytics()) {
              <p class="muted">No analytics yet.</p>
            }
          </div>
        </section>

        @if (detail()?.status === 'Published') {
          <app-response-form [survey]="detail()!" (submitted)="submit($event)"></app-response-form>
        }
        @if (detail()?.status !== 'Published') {
          <div class="card muted">Responses are only accepted when the survey is published.</div>
        }
      }

      @if (error()) {
        <p class="error">{{ error() }}</p>
      }
    </section>
  `,
  styles: [
    `
      .row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
      .title { margin: 0.1rem 0; }
      .muted { margin: 0.2rem 0; color: var(--muted); }
      .questions { display: grid; gap: 0.45rem; padding-left: 1.25rem; }
      .name { margin: 0; font-weight: 700; }
      .bar-block { margin-top: 0.6rem; }
      .bar-row { display: grid; grid-template-columns: 1fr 1fr auto; align-items: center; gap: 0.4rem; }
      .bar { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
      .fill { display: block; height: 100%; background: linear-gradient(90deg, #2563eb, #22d3ee); }
      .actions { display: grid; gap: 0.5rem; justify-items: end; }
      .action-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
      .error { color: #f87171; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(SurveyApiService);
  private readonly router = inject(Router);

  detail = signal<SurveyDetail | null>(null);
  analytics = signal<SurveyAnalyticsDto | null>(null);
  loading = signal(false);
  error = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Missing survey id');
      return;
    }
    this.fetch(id);
  }

  publish(): void {
    const id = this.detail()?.id;
    if (!id) return;
    this.api.publish(id).subscribe({ next: () => this.fetch(id) });
  }

  close(): void {
    const id = this.detail()?.id;
    if (!id) return;
    this.api.close(id).subscribe({ next: () => this.fetch(id) });
  }

  delete(): void {
    const id = this.detail()?.id;
    if (!id) return;
    if (!confirm('Delete this survey?')) return;
    this.api.remove(id).subscribe({ next: () => this.router.navigate(['/surveys']) });
  }

  submit(payload: SurveyResponseCreateDto): void {
    const id = this.detail()?.id;
    if (!id) return;
    this.api.submitResponse(id, payload).subscribe({
      next: () => this.fetch(id),
      error: (err) => {
        console.error(err);
        alert('Submission failed. Ensure all answers are valid.');
      },
    });
  }

  private fetch(id: string): void {
    this.loading.set(true);
    this.error.set('');
    this.api.get(id).subscribe({
      next: (data) => {
        this.detail.set(data);
        this.loading.set(false);
        this.loadAnalytics(id);
      },
      error: (err) => {
        console.error(err);
        this.error.set('Survey not found.');
        this.loading.set(false);
      },
    });
  }

  private loadAnalytics(id: string): void {
    this.api.analytics(id).subscribe({
      next: (data) => this.analytics.set(data),
      error: () => this.analytics.set(null),
    });
  }

  barWidth(count: number, total: number): number {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  }
}
