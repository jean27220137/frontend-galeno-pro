import { Routes } from '@angular/router';
export const hospitalizacionRoutes: Routes = [
  { path: '', loadComponent: () => import('./hospitalizacion.component').then(m => m.HospitalizacionComponent),
    children: [
      { path: 'mapa-camas',    loadComponent: () => import('./mapa-camas/mapa-camas.component').then(m => m.MapaCamasComponent) },
      { path: 'admision',      loadComponent: () => import('./admision/admision-hosp.component').then(m => m.AdmisionHospComponent) },
      { path: 'alta',          loadComponent: () => import('./alta/alta-paciente.component').then(m => m.AltaPacienteComponent) },
      { path: 'evolucion',     loadComponent: () => import('./evolucion/evolucion.component').then(m => m.EvolucionComponent) },
      { path: 'indicaciones',  loadComponent: () => import('./indicaciones/indicaciones.component').then(m => m.IndicacionesComponent) },
      { path: '', redirectTo: 'mapa-camas', pathMatch: 'full' },
    ],
  },
];
