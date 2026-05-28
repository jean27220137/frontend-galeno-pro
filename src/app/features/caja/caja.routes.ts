import { Routes } from '@angular/router';
export const cajaRoutes: Routes = [
  { path: '', loadComponent: () => import('./caja.component').then(m => m.CajaComponent),
    children: [
      { path: 'apertura', loadComponent: () => import('./apertura/apertura-caja.component').then(m => m.AperturaCajaComponent) },
      { path: 'cobros',   loadComponent: () => import('./cobros/cobros.component').then(m => m.CobrosComponent) },
      { path: 'cierre',   loadComponent: () => import('./cierre/cierre-caja.component').then(m => m.CierreCajaComponent) },
      { path: '', redirectTo: 'cobros', pathMatch: 'full' },
    ],
  },
];
