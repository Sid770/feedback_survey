import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-overlay',
  template: `
    @if (visible()) {
      <div class="overlay" role="status" aria-live="polite">
        <div class="spinner"></div>
        <p>{{ label() }}</p>
      </div>
    }
  `,
  styles: [
    `
      .overlay {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        gap: 0.5rem;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(6px);
        border-radius: 1rem;
        z-index: 10;
      }
      .spinner {
        width: 42px;
        height: 42px;
        border-radius: 999px;
        border: 4px solid rgba(255, 255, 255, 0.08);
        border-top-color: #22d3ee;
        animation: spin 1s linear infinite;
      }
      p {
        margin: 0;
        color: var(--muted);
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlayComponent {
  visible = input<boolean>(false);
  label = input<string>('Loading...');
}
