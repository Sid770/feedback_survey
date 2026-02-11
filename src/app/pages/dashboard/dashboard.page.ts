import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SurveyApiService } from '../../services/survey-api.service';
import { SurveySummary } from '../../models/survey.model';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../components/empty-state/empty-state.component';
import { LoadingOverlayComponent } from '../../components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink, StatCardComponent, StatusBadgeComponent, EmptyStateComponent, LoadingOverlayComponent],
  template: `
    <section class="grid gap-4">
      <div class="grid-auto-fill">
        <app-stat-card label="Published" [value]="publishedCount()" hint="Live to students" />
        <app-stat-card label="Drafts" [value]="draftCount()" hint="Needs publish" />
        <app-stat-card label="Closed" [value]="closedCount()" hint="Archived" />
        <app-stat-card label="Total" [value]="surveys().length" />
      </div>

      <section class="card" style="position: relative;">
        <div class="row">
          <div>
            <p class="eyebrow">Recent surveys</p>
            <h2 class="section-title">Operational overview</h2>
          </div>
          <a routerLink="/surveys/new" class="btn">Create survey</a>
        </div>

        <app-loading-overlay [visible]="loading()" label="Loading surveys" />

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        @if (!loading() && surveys().length === 0) {
          <app-empty-state title="No surveys yet" message="Create a survey to start collecting feedback.">
            <a routerLink="/surveys/new" class="btn">Start now</a>
          </app-empty-state>
        }

        @if (!loading() && surveys().length > 0) {
          <div class="table-wrapper">
            <table class="table" aria-label="Surveys">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (s of recentSurveys(); track s.id) {
                  <tr>
                    <td>
                      <div class="title-cell">
                        <p class="name">{{ s.title }}</p>
                        <p class="muted">{{ s.description }}</p>
                      </div>
                    </td>
                    <td><app-status-badge [status]="s.status" /></td>
                    <td>{{ s.createdAtUtc | date:'mediumDate' }}</td>
                    <td class="actions-cell">
                      <a [routerLink]="['/surveys', s.id]" class="btn ghost">Open</a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </section>
  `,
  styles: [
    `
      .row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
      .section-title { margin: 0.1rem 0 0; font-size: 1.4rem; }
      .table-wrapper { overflow-x: auto; }
      .title-cell { display: grid; gap: 0.2rem; }
      .name { margin: 0; font-weight: 700; }
      .muted { margin: 0; color: var(--muted); }
      .error { color: #f87171; }
      .actions-cell { text-align: right; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly api = inject(SurveyApiService);

  surveys = signal<SurveySummary[]>([]);
  loading = signal(false);
  error = signal('');

  publishedCount = computed(() => this.surveys().filter((s) => s.status === 'Published').length);
  draftCount = computed(() => this.surveys().filter((s) => s.status === 'Draft').length);
  closedCount = computed(() => this.surveys().filter((s) => s.status === 'Closed').length);
  recentSurveys = computed(() => this.surveys().slice(0, 5));

  ngOnInit(): void {
    this.fetch();
  }

  private fetch(): void {
    this.loading.set(true);
    this.error.set('');
    this.api.list().subscribe({
      next: (data) => {
        this.surveys.set(data.sort((a, b) => (a.createdAtUtc > b.createdAtUtc ? -1 : 1)));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Unable to load surveys. Check backend connection.');
        console.error(err);
        this.loading.set(false);
      },
    });
  }
}
