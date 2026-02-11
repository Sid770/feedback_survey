import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <section class="card empty">
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
      <ng-content></ng-content>
    </section>
  `,
  styles: [
    `
      .empty {
        text-align: center;
        display: grid;
        gap: 0.5rem;
      }
      h3 {
        margin: 0;
        font-size: 1.2rem;
      }
      p {
        margin: 0;
        color: var(--muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  title = input.required<string>();
  message = input.required<string>();
}
