import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
	},
	{
		path: 'surveys',
		loadComponent: () => import('./pages/surveys/surveys.page').then((m) => m.SurveysPage),
	},
	{
		path: 'surveys/new',
		loadComponent: () => import('./pages/surveys/survey-create.page').then((m) => m.SurveyCreatePage),
	},
	{
		path: 'surveys/:id',
		loadComponent: () => import('./pages/surveys/survey-detail.page').then((m) => m.SurveyDetailPage),
	},
	{ path: '**', redirectTo: '' },
];
