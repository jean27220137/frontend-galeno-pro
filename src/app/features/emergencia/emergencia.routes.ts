import { Routes } from '@angular/router';
export const emergenciaRoutes: Routes = [
  { path: '', loadComponent: () => import('./emergencia.component').then(m => m.EmergenciaComponent),
    children: [
      { path: 'admision',     loadComponent: () => import('./admision/admision-emergencia.component').then(m => m.AdmisionEmergenciaComponent) },
      { path: 'triage',       loadComponent: () => import('./triage/triage-emergencia.component').then(m => m.TriageEmergenciaComponent) },
      { path: 'observacion',  loadComponent: () => import('./observacion/observacion.component').then(m => m.ObservacionComponent) },
      { path: '', redirectTo: 'admision', pathMatch: 'full' },
    ],
  },
];
