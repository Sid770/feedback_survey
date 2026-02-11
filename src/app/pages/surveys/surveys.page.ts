import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SurveyApiService } from '../../services/survey-api.service';
import { SurveySummary, SurveyStatus } from '../../models/survey.model';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';

@Component({
  selector: 'app-surveys-page',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, StatusBadgeComponent, LoadingOverlayComponent, EmptyStateComponent, DatePipe],
  template: `
    <section class="card" style="position: relative;">
      <div class="row">
        <div>
          <p class="eyebrow">Surveys</p>
          <h2 class="section-title">Manage lifecycle</h2>
        </div>
        <a routerLink="/surveys/new" class="btn">New survey</a>
      </div>

      <div class="filters">
        <input class="input" [formControl]="query" placeholder="Search title or description" aria-label="Search" />
        <select class="select" [formControl]="statusFilter" aria-label="Status filter">
          <option value="all">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <app-loading-overlay [visible]="loading()" label="Loading surveys" />

      @if (!loading() && filtered().length === 0) {
        <app-empty-state title="No matches" message="Adjust filters or create a new survey.">
          <a routerLink="/surveys/new" class="btn">Create survey</a>
        </app-empty-state>
      }

      @if (!loading() && filtered().length > 0) {
        <div class="table-wrapper">
          <table class="table" aria-label="Surveys table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (s of filtered(); track s.id) {
                <tr>
                  <td>
                    <div class="title-cell">
                      <a [routerLink]="['/surveys', s.id]" class="link">{{ s.title }}</a>
                      <p class="muted">{{ s.description }}</p>
                    </div>
                  </td>
                  <td><app-status-badge [status]="s.status" /></td>
                  <td>{{ s.createdAtUtc | date:'medium' }}</td>
                  <td class="actions-cell">
                    <div class="action-group">
                      @if (s.status === 'Draft') {
                        <button class="btn ghost" (click)="publish(s)">Publish</button>
                      }
                      @if (s.status === 'Published') {
                        <button class="btn ghost" (click)="close(s)">Close</button>
                      }
                      <button class="btn ghost" (click)="remove(s)">Delete</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
      .section-title { margin: 0.1rem 0 0; }
      .filters { display: grid; grid-template-columns: 1fr 200px; gap: 0.6rem; margin: 1rem 0; }
      .table-wrapper { overflow-x: auto; }
      .title-cell { display: grid; gap: 0.15rem; }
      .muted { margin: 0; color: var(--muted); }
      .actions-cell { text-align: right; }
      .action-group { display: inline-flex; gap: 0.4rem; flex-wrap: wrap; }
      .link { color: #cbd5e1; font-weight: 700; }
      @media (max-width: 768px) { .filters { grid-template-columns: 1fr; } }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveysPage implements OnInit {
  private readonly api = inject(SurveyApiService);

  loading = signal(false);
  surveys = signal<SurveySummary[]>([]);
  query = new FormControl('');
  statusFilter = new FormControl<'all' | SurveyStatus>('all');

  filtered = computed(() => {
    const text = (this.query.value ?? '').toLowerCase();
    const status = this.statusFilter.value ?? 'all';
    return this.surveys().filter((s) => {
      const matchesText = s.title.toLowerCase().includes(text) || s.description.toLowerCase().includes(text);
      const matchesStatus = status === 'all' || s.status === status;
      return matchesText && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.refresh();
  }

  publish(s: SurveySummary): void {
    this.loading.set(true);
    this.api.publish(s.id).subscribe({
      next: () => this.refresh(),
      error: (err) => this.handleError(err),
    });
  }

  close(s: SurveySummary): void {
    this.loading.set(true);
    this.api.close(s.id).subscribe({
      next: () => this.refresh(),
      error: (err) => this.handleError(err),
    });
  }

  remove(s: SurveySummary): void {
    if (!confirm('Delete this survey?')) return;
    this.loading.set(true);
    this.api.remove(s.id).subscribe({
      next: () => this.refresh(),
      error: (err) => this.handleError(err),
    });
  }

  private refresh(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (data) => {
        this.surveys.set(data);
        this.loading.set(false);
      },
      error: (err) => this.handleError(err),
    });
  }

  private handleError(err: unknown): void {
    console.error(err);
    alert('Action failed. Check backend connectivity.');
    this.loading.set(false);
  }
}
