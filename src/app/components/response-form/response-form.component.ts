import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Question, QuestionType, SurveyDetail, SurveyResponseCreateDto } from '../../models/survey.model';

@Component({
  selector: 'app-response-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="header-row">
        <h3>Submit feedback</h3>
        <button type="submit" class="btn">Send anonymously</button>
      </div>
      @if (survey(); as s) {
        <div class="questions">
          @for (q of s.questions; track q.id; let i = $index) {
            <div class="question-card">
              <p class="question">{{ q.text }}</p>
              @if (q.type === 'SingleChoice') {
                <div class="choices">
                  @for (opt of q.options; track opt.id) {
                    <label class="choice">
                      <input
                        type="radio"
                        [value]="opt.id"
                        [formControl]="answerControl(i)"
                        required
                      />
                      <span>{{ opt.text }}</span>
                    </label>
                  }
                </div>
              }
              @if (q.type === 'Text') {
                <textarea
                  rows="3"
                  class="input"
                  [formControl]="answerControl(i)"
                  placeholder="Share your thoughts"
                ></textarea>
              }
              @if (answerInvalid(i)) {
                <p class="error">Please provide an answer.</p>
              }
            </div>
          }
        </div>
      }
    </form>
  `,
  styles: [
    `
      form { display: grid; gap: 0.9rem; position: relative; }
      .questions { display: grid; gap: 0.75rem; }
      .question-card {
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 0.9rem;
        padding: 0.85rem;
        background: rgba(255,255,255,0.02);
      }
      .question {
        margin: 0 0 0.35rem;
        font-weight: 600;
      }
      .choices { display: grid; gap: 0.35rem; }
      .choice {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.35rem 0.6rem;
        border-radius: 0.6rem;
        background: rgba(255,255,255,0.03);
      }
      .error { color: #f87171; margin: 0.25rem 0 0; }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResponseFormComponent implements OnChanges {
  survey = input.required<SurveyDetail>();
  submitted = output<SurveyResponseCreateDto>();

  private readonly fb = inject(FormBuilder);
  form: FormGroup = this.fb.group({ answers: this.fb.array([]) });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['survey'] && this.survey()) {
      this.buildForm(this.survey());
    }
  }

  get answers(): FormArray<FormControl> {
    return this.form.get('answers') as FormArray<FormControl>;
  }

  answerControl(index: number): FormControl {
    return this.answers.at(index) as FormControl;
  }

  answerInvalid(index: number): boolean {
    const ctrl = this.answerControl(index);
    return ctrl.invalid && ctrl.touched;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (!this.survey() || this.form.invalid) {
      return;
    }

    const payload: SurveyResponseCreateDto = {
      answers: this.survey().questions.map((q, idx) => this.mapAnswer(q, this.answerControl(idx))),
    };

    this.submitted.emit(payload);
  }

  private buildForm(survey: SurveyDetail): void {
    const controls = survey.questions.map((q) =>
      this.fb.control('', q.type === 'SingleChoice' ? Validators.required : Validators.required)
    );
    this.form.setControl('answers', this.fb.array(controls));
  }

  private mapAnswer(question: Question, control: FormControl): { questionId: string; textAnswer?: string; selectedOptionId?: string } {
    const value = control.value as string;
    return {
      questionId: question.id,
      textAnswer: question.type === 'Text' ? value : undefined,
      selectedOptionId: question.type === 'SingleChoice' ? value : undefined,
    };
  }
}
