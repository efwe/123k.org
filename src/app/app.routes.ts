import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  {
    path: 'index',
    loadComponent: () => import('./main/main').then((m) => m.Main),
  },
];
