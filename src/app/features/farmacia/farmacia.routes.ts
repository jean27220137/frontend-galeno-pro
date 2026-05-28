import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const farmaciaRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./farmacia.component').then(m => m.FarmaciaComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/farmacia-dashboard.component')
            .then(m => m.FarmaciaDashboardComponent),
      },
      {
        path: 'inventario',
        loadComponent: () =>
          import('./components/inventario/inventario.component')
            .then(m => m.InventarioComponent),
      },
      {
        path: 'movimientos',
        loadComponent: () =>
          import('./components/movimientos/movimientos.component')
            .then(m => m.MovimientosComponent),
        canActivate: [roleGuard(['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA', 'TECNICO_FARMACIA'])],
      },
      {
        path: 'alertas',
        loadComponent: () =>
          import('./components/alertas/alertas.component')
            .then(m => m.AlertasComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./components/categorias/categorias.component')
            .then(m => m.CategoriasComponent),
        canActivate: [roleGuard(['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA'])],
      },
      {
        path: 'farmacias',
        loadComponent: () =>
          import('./components/farmacia-modal/farmacias-lista.component')
            .then(m => m.FarmaciasListaComponent),
        canActivate: [roleGuard(['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA'])],
      },
      {
        path: 'gestionar-usuarios',
        loadComponent: () =>
          import('./components/gestionar-usuarios/gestionar-usuarios.component')
            .then(m => m.GestionarUsuariosComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'crear-usuario',
        loadComponent: () =>
          import('./components/crear-usuario/crear-usuario.component')
            .then(m => m.CrearUsuarioComponent),
        canActivate: [adminGuard],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
