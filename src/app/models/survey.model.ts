export type SurveyStatus = 'Draft' | 'Published' | 'Closed';
export type QuestionType = 'SingleChoice' | 'Text';

export interface OptionChoice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: OptionChoice[];
}

export interface SurveySummary {
  id: string;
  title: string;
  description: string;
  status: SurveyStatus;
  createdAtUtc: string;
}

export interface SurveyDetail extends SurveySummary {
  questions: Question[];
  responseCount: number;
}

export interface SurveyCreateDto {
  title: string;
  description: string;
  createdBy: string;
  questions: Array<{
    text: string;
    type: QuestionType;
    options: Array<{ id?: string; text: string }>;
  }>;
}

export interface SurveyUpdateDto {
  title: string;
  description: string;
  questions: Array<{
    text: string;
    type: QuestionType;
    options: Array<{ id?: string; text: string }>;
  }>;
}

export interface ResponseItemCreateDto {
  questionId: string;
  textAnswer?: string | null;
  selectedOptionId?: string | null;
}

export interface SurveyResponseCreateDto {
  answers: ResponseItemCreateDto[];
}

export interface OptionAnalyticsDto {
  optionId: string;
  text: string;
  count: number;
}

export interface QuestionAnalyticsDto {
  questionId: string;
  text: string;
  type: QuestionType;
  responseCount: number;
  options: OptionAnalyticsDto[];
}

export interface SurveyAnalyticsDto {
  surveyId: string;
  title: string;
  totalResponses: number;
  questions: QuestionAnalyticsDto[];
}
