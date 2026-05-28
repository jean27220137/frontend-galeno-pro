import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../shared/models/user.model';

@Component({
  selector: 'app-farmacia',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="tw-flex tw-flex-col tw-min-h-[calc(100vh-64px)]">
      <!-- Sub-navegación interna del módulo Farmacia -->
      <nav class="farmacia-subnav" aria-label="Sub-navegación Farmacia">
        <div class="farmacia-subnav__inner">
          <div class="farmacia-subnav__module-label">
            <i class="pi pi-box tw-text-[#2378f0]"></i>
            <span class="farmacia-subnav__label-text">Farmacia</span>
          </div>
          <div class="farmacia-subnav__links">
            @for (link of visibleNavLinks(); track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="farmacia-subnav__link--active"
                class="farmacia-subnav__link"
                [title]="link.label">
                <i [class]="link.icon"></i>
                <span class="farmacia-subnav__label-text">{{ link.label }}</span>
              </a>
            }
            @if (isAdmin()) {
              @for (link of adminLinks; track link.path) {
                <a
                  [routerLink]="link.path"
                  routerLinkActive="farmacia-subnav__link--active"
                  class="farmacia-subnav__link farmacia-subnav__link--admin"
                  [title]="link.label">
                  <i [class]="link.icon"></i>
                  <span class="farmacia-subnav__label-text">{{ link.label }}</span>
                </a>
              }
            }
          </div>
        </div>
      </nav>

      <!-- Contenido del sub-módulo activo -->
      <div class="gp-page-container tw-flex-1 gp-fade-in">
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .farmacia-subnav {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 64px;
      z-index: 90;
      box-shadow: 0 1px 4px rgba(0,0,0,.05);
    }
    .farmacia-subnav__inner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.5rem;
      height: 48px;
      overflow-x: auto;
    }
    .farmacia-subnav__module-label {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-weight: 700;
      font-size: 0.875rem;
      color: #1e293b;
      white-space: nowrap;
      padding-right: 0.75rem;
      border-right: 1px solid #e2e8f0;
      margin-right: 0.25rem;
    }
    .farmacia-subnav__links {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .farmacia-subnav__link {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.625rem;
      border-radius: 0.375rem;
      font-size: 0.8125rem;
      font-weight: 500;
      color: #64748b;
      text-decoration: none;
      white-space: nowrap;
      transition: all 0.15s;
    }
    .farmacia-subnav__link:hover { background: #f1f5f9; color: #1e293b; }
    .farmacia-subnav__link--active { background: #e8f0fe; color: #2378f0; font-weight: 600; }
    .farmacia-subnav__link--admin { border-left: 1px solid #e2e8f0; margin-left: 0.25rem; padding-left: 0.75rem; }
    @media (max-width: 639px) {
      .farmacia-subnav__label-text { display: none; }
      .farmacia-subnav__link { padding: 0.375rem 0.5rem; }
    }
  `],
})
export class FarmaciaComponent {
  private readonly authService = inject(AuthService);
  readonly isAdmin = computed(() => this.authService.userRole() === 'ADMIN');

  private readonly allNavLinks: { path: string; label: string; icon: string; roles: UserRole[] }[] = [
    {
      path: 'dashboard',
      label: 'Dashboard',
      icon: 'pi pi-chart-bar',
      roles: ['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA', 'TECNICO_FARMACIA', 'AUXILIAR_ALMACEN'],
    },
    {
      path: 'inventario',
      label: 'Inventario',
      icon: 'pi pi-list',
      roles: ['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA', 'TECNICO_FARMACIA', 'AUXILIAR_ALMACEN'],
    },
    {
      path: 'movimientos',
      label: 'Movimientos',
      icon: 'pi pi-arrow-right-arrow-left',
      roles: ['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA', 'TECNICO_FARMACIA'],
    },
    {
      path: 'alertas',
      label: 'Alertas',
      icon: 'pi pi-bell',
      roles: ['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA', 'TECNICO_FARMACIA', 'AUXILIAR_ALMACEN'],
    },
    {
      path: 'categorias',
      label: 'Categorías',
      icon: 'pi pi-tag',
      roles: ['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA'],
    },
    {
      path: 'farmacias',
      label: 'Farmacias',
      icon: 'pi pi-home',
      roles: ['ADMIN', 'QUIMICO_FARMACEUTICO', 'JEFE_FARMACIA'],
    },
  ];

  readonly visibleNavLinks = computed(() => {
    const role = this.authService.userRole() as UserRole | null;
    if (!role) return [];
    return this.allNavLinks.filter(link => link.roles.includes(role));
  });

  adminLinks = [
    { path: 'crear-usuario',      label: 'Crear Usuario',      icon: 'pi pi-user-plus' },
    { path: 'gestionar-usuarios', label: 'Gestionar Usuarios', icon: 'pi pi-users' },
  ];
}
