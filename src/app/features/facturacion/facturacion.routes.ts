import { Routes } from '@angular/router';
export const facturacionRoutes: Routes = [
  { path: '', loadComponent: () => import('./facturacion.component').then(m => m.FacturacionComponent),
    children: [
      { path: 'nueva',          loadComponent: () => import('./nueva/nueva-factura.component').then(m => m.NuevaFacturaComponent) },
      { path: 'emitidas',       loadComponent: () => import('./emitidas/facturas-emitidas.component').then(m => m.FacturasEmitidasComponent) },
      { path: 'notas-credito',  loadComponent: () => import('./notas-credito/notas-credito.component').then(m => m.NotasCreditoComponent) },
      { path: '', redirectTo: 'emitidas', pathMatch: 'full' },
    ],
  },
];
