import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
    ),
    provideHttpClient(
      withInterceptors([authInterceptor]),
    ),
    provideAnimationsAsync(),
    MessageService,
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: '.gp-dark',
          cssLayer: false,
        },
      },
      ripple: true,
      // Traducción al español
      translation: {
        accept: 'Aceptar',
        reject: 'Cancelar',
        cancel: 'Cancelar',
        clear: 'Limpiar',
        apply: 'Aplicar',
        fileSizeTypes: ['B', 'KB', 'MB', 'GB', 'TB'],
        dayNames: ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
        dayNamesShort: ['dom','lun','mar','mié','jue','vie','sáb'],
        dayNamesMin: ['D','L','M','X','J','V','S'],
        monthNames: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
        monthNamesShort: ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'],
        dateFormat: 'dd/mm/yy',
        firstDayOfWeek: 1,
        today: 'Hoy',
        weekHeader: 'Sem',
        noFilter: 'Sin filtro',
        emptyMessage: 'No se encontraron resultados',
        emptyFilterMessage: 'No se encontraron resultados',
        aria: {
          trueLabel: 'Verdadero',
          falseLabel: 'Falso',
          nullLabel: 'No seleccionado',
          pageLabel: 'Página',
          firstPageLabel: 'Primera página',
          lastPageLabel: 'Última página',
          nextPageLabel: 'Página siguiente',
          previousPageLabel: 'Página anterior',
        }
      }
    }),
  ],
};
