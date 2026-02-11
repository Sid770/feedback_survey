import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  SurveySummary,
  SurveyDetail,
  SurveyCreateDto,
  SurveyUpdateDto,
  SurveyAnalyticsDto,
  SurveyResponseCreateDto,
} from '../models/survey.model';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SurveyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/surveys`;

  list(): Observable<SurveySummary[]> {
    return this.http.get<SurveySummary[]>(this.baseUrl);
  }

  get(id: string): Observable<SurveyDetail> {
    return this.http.get<SurveyDetail>(`${this.baseUrl}/${id}`);
  }

  create(payload: SurveyCreateDto): Observable<SurveyDetail> {
    return this.http.post<SurveyDetail>(this.baseUrl, payload);
  }

  update(id: string, payload: SurveyUpdateDto): Observable<SurveyDetail> {
    return this.http.put<SurveyDetail>(`${this.baseUrl}/${id}`, payload);
  }

  publish(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/publish`, {});
  }

  close(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/close`, {});
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  submitResponse(id: string, payload: SurveyResponseCreateDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/responses`, payload);
  }

  analytics(id: string): Observable<SurveyAnalyticsDto> {
    return this.http.get<SurveyAnalyticsDto>(`${this.baseUrl}/${id}/analytics`);
  }
}
