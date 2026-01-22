import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  {
    path: 'index',
    loadComponent: () => import('./main/main').then((m) => m.Main),
  },
  {
    path: 'geohashing',
    loadComponent: () =>
      import('./geohashing/geo-hash-map.component').then((m) => m.GeoHashMapComponent),
  },
  {
    path: 'geohashing/:lat/:lng',
    loadComponent: () =>
      import('./geohashing/geo-hash-map.component').then((m) => m.GeoHashMapComponent),
  },
  {
    path: 'tracks',
    loadComponent: () => import('./tracks/tracks.component').then((m) => m.TracksComponent),
  },
];
