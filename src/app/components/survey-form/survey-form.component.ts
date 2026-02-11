import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { QuestionType, SurveyCreateDto, SurveyDetail, SurveyUpdateDto } from '../../models/survey.model';

@Component({
  selector: 'app-survey-form',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form class="card" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
      <div class="form-grid">
        <div>
          <label for="title">Title</label>
          <input id="title" class="input" formControlName="title" placeholder="e.g. Campus Facilities Feedback" />
          @if (controlInvalid('title')) {
            <p class="error">Title is required.</p>
          }
        </div>
        <div>
          <label for="createdBy">Created By</label>
          <input id="createdBy" class="input" formControlName="createdBy" placeholder="e.g. admin" />
          @if (controlInvalid('createdBy')) {
            <p class="error">Creator is required.</p>
          }
        </div>
      </div>

      <div>
        <label for="description">Description</label>
        <textarea id="description" rows="3" formControlName="description" placeholder="Purpose of the survey"></textarea>
        @if (controlInvalid('description')) {
          <p class="error">Description is required.</p>
        }
      </div>

      <div class="questions">
        <div class="header-row">
          <h3>Questions</h3>
          <button type="button" class="btn ghost" (click)="addQuestion()">Add question</button>
        </div>

        @if (questions.controls.length === 0) {
          <p class="muted">Add at least one question.</p>
        }

        @for (q of questions.controls; track q) {
          <div class="question-card">
            <div class="row">
              <label>Question Text</label>
              <button type="button" class="btn ghost" (click)="removeQuestion(q)">Remove</button>
            </div>
            <input class="input" [formControl]="questionTextControl(q)" placeholder="Enter question" />
            @if (q.get('text')?.invalid && q.get('text')?.touched) {
              <p class="error">Question text is required.</p>
            }

            <div class="row">
              <label>Type</label>
              <select class="select" [formControl]="questionTypeControl(q)" (change)="onTypeChanged(q)">
                <option value="SingleChoice">Single choice</option>
                <option value="Text">Free text</option>
              </select>
            </div>

            @if (questionType(q) === 'SingleChoice') {
              <div class="options">
                <div class="row">
                  <p class="muted">Options</p>
                  <button type="button" class="btn ghost" (click)="addOption(q)">Add option</button>
                </div>
                @for (opt of options(q).controls; track opt) {
                  <div class="option-row">
                    <input class="input" [formControl]="optionTextControl(opt)" placeholder="Option text" />
                    <button type="button" class="btn ghost" (click)="removeOption(q, opt)">Remove</button>
                  </div>
                  @if (opt.get('text')?.invalid && opt.get('text')?.touched) {
                    <p class="error">Option text is required.</p>
                  }
                }
              </div>
            }
          </div>
        }
      </div>

      <div class="actions">
        <button type="submit" class="btn">{{ ctaLabel() }}</button>
        <button type="button" class="btn secondary" (click)="resetForm()">Reset</button>
      </div>
    </form>
  `,
  styles: [
    `
      form {
        position: relative;
        display: grid;
        gap: 1rem;
      }
      label {
        display: block;
        font-weight: 600;
        margin-bottom: 0.35rem;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 1rem;
      }
      .questions {
        display: grid;
        gap: 0.6rem;
      }
      .header-row,
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .question-card {
        border: 1px dashed rgba(255, 255, 255, 0.08);
        border-radius: 0.9rem;
        padding: 0.9rem;
        background: rgba(255, 255, 255, 0.02);
        display: grid;
        gap: 0.6rem;
      }
      .options {
        display: grid;
        gap: 0.5rem;
      }
      .option-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.5rem;
        align-items: center;
      }
      .actions {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
      }
      .error {
        color: #f87171;
        margin: 0.2rem 0 0;
      }
      .muted {
        color: var(--muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyFormComponent implements OnInit {
  initial = input<SurveyDetail>();
  mode = input<'create' | 'edit'>('create');
  submitted = output<SurveyCreateDto | SurveyUpdateDto>();

  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    createdBy: ['admin', [Validators.required]],
    questions: this.fb.array([]),
  });

  ctaLabel = computed(() => (this.mode() === 'edit' ? 'Save changes' : 'Create survey'));

  ngOnInit(): void {
    const data = this.initial();
    if (data) {
      this.form.patchValue({
        title: data.title,
        description: data.description,
        createdBy: 'admin',
      });
      data.questions.forEach((q) => {
        const qGroup = this.buildQuestionGroup(q.text, q.type, q.options.map((o) => o.text));
        this.questions.push(qGroup);
      });
    } else {
      this.addQuestion();
    }
  }

  get questions(): FormArray<FormGroup> {
    return this.form.get('questions') as FormArray<FormGroup>;
  }

  options(question: FormGroup): FormArray<FormGroup> {
    return question.get('options') as FormArray<FormGroup>;
  }

  addQuestion(): void {
    this.questions.push(this.buildQuestionGroup());
  }

  removeQuestion(q: FormGroup): void {
    const idx = this.questions.controls.indexOf(q);
    if (idx >= 0) {
      this.questions.removeAt(idx);
    }
  }

  addOption(question: FormGroup): void {
    this.options(question).push(this.buildOptionGroup());
  }

  removeOption(question: FormGroup, option: FormGroup): void {
    const opts = this.options(question);
    const idx = opts.controls.indexOf(option);
    if (idx >= 0) {
      opts.removeAt(idx);
    }
  }

  questionTextControl(question: FormGroup): FormControl {
    return question.get('text') as FormControl;
  }

  questionTypeControl(question: FormGroup): FormControl {
    return question.get('type') as FormControl;
  }

  optionTextControl(option: FormGroup): FormControl {
    return option.get('text') as FormControl;
  }

  questionType(question: FormGroup): QuestionType {
    return (question.get('type')?.value as QuestionType) ?? 'SingleChoice';
  }

  onTypeChanged(question: FormGroup): void {
    const type = question.get('type')?.value as QuestionType;
    if (type === 'Text') {
      question.setControl('options', this.fb.array([]));
    } else if (type === 'SingleChoice' && this.options(question).length === 0) {
      question.setControl('options', this.fb.array([this.buildOptionGroup(), this.buildOptionGroup()]));
    }
  }

  resetForm(): void {
    this.form.reset({ createdBy: 'admin' });
    this.questions.clear();
    this.addQuestion();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.questions.length === 0) {
      return;
    }

    const payload: SurveyCreateDto = {
      title: this.form.value.title ?? '',
      description: this.form.value.description ?? '',
      createdBy: this.form.value.createdBy ?? 'admin',
      questions: this.questions.controls.map((q) => ({
        text: (q.get('text')?.value as string) ?? '',
        type: (q.get('type')?.value as QuestionType) ?? 'SingleChoice',
        options: this.options(q).controls.map((opt) => ({
          id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : Math.random().toString(36).slice(2),
          text: (opt.get('text')?.value as string) ?? '',
        })),
      })),
    };

    this.submitted.emit(payload);
  }

  private buildQuestionGroup(
    text = '',
    type: QuestionType = 'SingleChoice',
    optionTexts: string[] = ['Yes', 'No']
  ): FormGroup {
    return this.fb.group({
      text: [text, [Validators.required, Validators.minLength(3)]],
      type: [type, Validators.required],
      options: this.fb.array(
        type === 'SingleChoice'
          ? optionTexts.map((val) => this.buildOptionGroup(val)).slice(0, Math.max(2, optionTexts.length))
          : []
      ),
    });
  }

  private buildOptionGroup(text = ''): FormGroup {
    return this.fb.group({
      text: [text, [Validators.required, Validators.minLength(1)]],
    });
  }

  controlInvalid(controlName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }
}
