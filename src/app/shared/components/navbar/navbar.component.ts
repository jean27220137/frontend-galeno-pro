import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Menu } from 'primeng/menu';
import { Avatar } from 'primeng/avatar';
import { Ripple } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, Menu, Avatar, Ripple],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  private readonly router = inject(Router);
  readonly authService    = inject(AuthService);

  profileMenuItems: MenuItem[]  = [];
  showMobileMenu = signal(false);

  readonly mobileNavLinks = [
    { label: 'Dashboard',   icon: 'pi pi-chart-bar',              routerLink: '/farmacia/dashboard' },
    { label: 'Inventario',  icon: 'pi pi-list',                   routerLink: '/farmacia/inventario' },
    { label: 'Movimientos', icon: 'pi pi-arrow-right-arrow-left', routerLink: '/farmacia/movimientos' },
    { label: 'Alertas',     icon: 'pi pi-bell',                   routerLink: '/farmacia/alertas' },
    { label: 'Categorías',  icon: 'pi pi-tag',                    routerLink: '/farmacia/categorias' },
    { label: 'Farmacias',   icon: 'pi pi-home',                   routerLink: '/farmacia/farmacias' },
  ];

  ngOnInit(): void {
    this.buildProfileMenu();
  }

  private buildProfileMenu(): void {
    this.profileMenuItems = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        items: [
          {
            label: 'Cambiar Contraseña',
            icon: 'pi pi-key',
            command: () => this.router.navigate(['/auth/change-password']),
          },
          { separator: true },
          {
            label: 'Cerrar Sesión',
            icon: 'pi pi-sign-out',
            command: () => this.authService.logout(),
            styleClass: 'text-red-500',
          },
        ],
      },
    ];
  }
}
