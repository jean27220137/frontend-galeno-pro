import { Routes } from '@angular/router';

export const programacionRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./programacion.component').then(m => m.ProgramacionComponent),
    children: [
      {
        path: 'asignacion',
        loadComponent: () =>
          import('./components/calendario/asignacion-medicos.component')
            .then(m => m.AsignacionMedicosComponent),
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./components/calendario/asignacion-medicos.component')
            .then(m => m.AsignacionMedicosComponent),
      },
      {
        path: 'horarios',
        loadComponent: () =>
          import('./components/doctores/horarios.component')
            .then(m => m.HorariosComponent),
      },
      { path: '', redirectTo: 'asignacion', pathMatch: 'full' },
    ],
  },
];
