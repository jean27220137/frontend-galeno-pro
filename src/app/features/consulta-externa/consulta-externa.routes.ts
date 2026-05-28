import { Routes } from '@angular/router';

export const consultaExternaRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./consulta-externa.component').then(m => m.ConsultaExternaComponent),
    children: [
      // ── PACIENTE ────────────────────────────────────────────────
      {
        path: 'paciente',
        children: [
          { path: 'registro',  loadComponent: () => import('./paciente/registro/registro-paciente.component').then(m => m.RegistroPacienteComponent) },
          { path: 'busqueda',  loadComponent: () => import('./paciente/busqueda/busqueda-paciente.component').then(m => m.BusquedaPacienteComponent) },
          { path: 'historia',  loadComponent: () => import('./paciente/historia/historia-clinica.component').then(m => m.HistoriaClinicaComponent) },
          { path: '', redirectTo: 'registro', pathMatch: 'full' },
        ],
      },
      // ── CITAS ───────────────────────────────────────────────────
      {
        path: 'citas',
        children: [
          { path: 'nueva',       loadComponent: () => import('./citas/nueva/nueva-cita.component').then(m => m.NuevaCitaComponent) },
          { path: 'agenda',      loadComponent: () => import('./citas/agenda/agenda-citas.component').then(m => m.AgendaCitasComponent) },
          { path: 'reprogramar', loadComponent: () => import('./citas/reprogramar/reprogramar-cita.component').then(m => m.ReprogramarCitaComponent) },
          { path: '', redirectTo: 'agenda', pathMatch: 'full' },
        ],
      },
      // ── TRIAJE, ATENCIONES, COLAS ───────────────────────────────
      { path: 'triaje',        loadComponent: () => import('./triaje/triaje.component').then(m => m.TriajeComponent) },
      { path: 'atenciones',    loadComponent: () => import('./atenciones/atenciones.component').then(m => m.AtencionesComponent) },
      { path: 'gestor-colas',  loadComponent: () => import('./gestor-colas/gestor-colas.component').then(m => m.GestorColasComponent) },

      { path: '', redirectTo: 'citas/agenda', pathMatch: 'full' },
    ],
  },
];
