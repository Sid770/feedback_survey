import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  template: `
    <article class="card stat">
      <p class="label">{{ label() }}</p>
      <div class="value-row">
        <h3>{{ value() }}</h3>
        @if (badge(); as b) { <span class="pill">{{ b }}</span> }
      </div>
      @if (hint(); as h) { <p class="hint">{{ h }}</p> }
    </article>
  `,
  styles: [
    `
      .stat {
        display: grid;
        gap: 0.2rem;
      }
      .label {
        margin: 0;
        color: var(--muted);
        font-size: 0.95rem;
      }
      .value-row {
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }
      h3 {
        margin: 0;
        font-size: 1.8rem;
        letter-spacing: -0.02em;
      }
      .pill {
        background: rgba(34, 211, 238, 0.1);
        color: #67e8f9;
        border-radius: 999px;
        padding: 0.2rem 0.6rem;
        font-size: 0.85rem;
        border: 1px solid rgba(103, 232, 249, 0.4);
      }
      .hint {
        margin: 0;
        color: var(--muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string | number>();
  hint = input<string>();
  badge = input<string>();
}
