import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SurveyApiService } from '../../services/survey-api.service';
import { SurveyCreateDto, SurveyUpdateDto } from '../../models/survey.model';
import { SurveyFormComponent } from '../../components/survey-form/survey-form.component';

@Component({
  selector: 'app-survey-create-page',
  imports: [SurveyFormComponent],
  template: `
    <section class="card">
      <p class="eyebrow">New survey</p>
      <h2 class="section-title">Create and publish later</h2>
      <app-survey-form mode="create" (submitted)="save($event)"></app-survey-form>
    </section>
  `,
  styles: [
    `
      :host { display: block; }
      .section-title { margin: 0 0 1rem; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyCreatePage {
  private readonly api = inject(SurveyApiService);
  private readonly router = inject(Router);

  save(payload: SurveyCreateDto | SurveyUpdateDto): void {
    const createPayload: SurveyCreateDto = {
      ...(payload as SurveyCreateDto),
      createdBy: (payload as SurveyCreateDto).createdBy ?? 'admin',
    };

    this.api.create(createPayload).subscribe({
      next: (created) => this.router.navigate(['/surveys', created.id]),
      error: (err) => {
        console.error(err);
        alert('Failed to create survey.');
      },
    });
  }
}
