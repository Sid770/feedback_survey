import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SurveyStatus } from '../../models/survey.model';

@Component({
  selector: 'app-status-badge',
  template: `
    <span
      class="badge"
      [class.success]="tone() === 'success'"
      [class.warning]="tone() === 'warning'"
      [class.info]="tone() === 'info'"
      [class.muted]="tone() === 'muted'"
      aria-live="polite"
    >
      {{ status() }}
    </span>
  `,
  styles: [
    `
      .badge {
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
      .success {
        background: rgba(34, 197, 94, 0.1);
        color: #4ade80;
        border-color: rgba(34, 197, 94, 0.3);
      }
      .warning {
        background: rgba(234, 179, 8, 0.1);
        color: #facc15;
        border-color: rgba(234, 179, 8, 0.3);
      }
      .info {
        background: rgba(37, 99, 235, 0.1);
        color: #93c5fd;
        border-color: rgba(37, 99, 235, 0.3);
      }
      .muted {
        color: var(--muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<SurveyStatus>();

  tone = computed(() => {
    const value = this.status();
    if (value === 'Published') return 'success';
    if (value === 'Closed') return 'warning';
    if (value === 'Draft') return 'info';
    return 'muted';
  });
}
