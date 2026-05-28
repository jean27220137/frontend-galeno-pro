import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { Divider } from 'primeng/divider';

import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserListDto, UserRole } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, Button, Dialog, Tag, InputText,
    IconField, InputIcon, ConfirmDialog, Tooltip, Divider,
  ],
  providers: [ConfirmationService],
  templateUrl: './gestionar-usuarios.component.html',
})
export class GestionarUsuariosComponent implements OnInit {
  private readonly userService    = inject(UserService);
  private readonly notify         = inject(NotificationService);
  private readonly confirmService = inject(ConfirmationService);

  usuarios    = signal<UserListDto[]>([]);
  isLoading   = signal(true);
  isSaving    = signal(false);
  showModal   = signal(false);
  editingUser = signal<UserListDto | null>(null);
  searchText  = signal('');

  rolesDisponibles: { label: string; value: UserRole; icon: string }[] = [
    { label: 'Técnico de Farmacia',  value: 'TECNICO_FARMACIA',     icon: 'pi pi-wrench' },
    { label: 'Químico Farmacéutico', value: 'QUIMICO_FARMACEUTICO', icon: 'pi pi-flask' },
    { label: 'Jefe de Farmacia',     value: 'JEFE_FARMACIA',        icon: 'pi pi-star' },
    { label: 'Auxiliar de Almacén',  value: 'AUXILIAR_ALMACEN',     icon: 'pi pi-box' },
  ];

  rolesSeleccionados = signal<UserRole[]>([]);

  usuariosFiltrados = computed(() => {
    const q = this.searchText().toLowerCase().trim();
    if (!q) return this.usuarios();
    return this.usuarios().filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.nombres.toLowerCase().includes(q) ||
      u.apellidoPaterno.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading.set(true);
    this.userService.getAll().subscribe({
      next: (users) => { this.usuarios.set(users); this.isLoading.set(false); },
      error: ()      => { this.usuarios.set(this.getMock()); this.isLoading.set(false); },
    });
  }

  abrirEditar(u: UserListDto): void {
    this.editingUser.set(u);
    this.rolesSeleccionados.set([...u.roles]);
    this.showModal.set(true);
  }

  toggleRol(valor: UserRole): void {
    const actual = this.rolesSeleccionados();
    if (actual.includes(valor)) {
      this.rolesSeleccionados.set(actual.filter(r => r !== valor));
    } else {
      this.rolesSeleccionados.set([...actual, valor]);
    }
  }

  guardarRoles(): void {
    if (this.rolesSeleccionados().length === 0) {
      this.notify.error('Debes asignar al menos un rol');
      return;
    }
    const user = this.editingUser();
    if (!user) return;
    this.isSaving.set(true);
    this.userService.updateRoles(user.id, { roles: this.rolesSeleccionados() }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showModal.set(false);
        this.notify.success('Roles actualizados correctamente');
        this.load();
      },
      error: () => {
        this.isSaving.set(false);
        this.notify.error('Error al actualizar roles');
      },
    });
  }

  toggleEstado(u: UserListDto): void {
    const accion = u.estado === 'ACTIVO' ? 'desactivar' : 'activar';
    this.confirmService.confirm({
      message: `¿Deseas <strong>${accion}</strong> al usuario <strong>${u.username}</strong>?`,
      header: 'Confirmar acción',
      icon: u.estado === 'ACTIVO' ? 'pi pi-ban' : 'pi pi-check-circle',
      acceptLabel: 'Sí',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: u.estado === 'ACTIVO' ? 'p-button-warning' : 'p-button-success',
      accept: () => {
        this.userService.toggleEnabled(u.id).subscribe({
          next: () => { this.notify.success(`Usuario ${accion}do`); this.load(); },
          error: () => this.notify.error('No se pudo cambiar el estado'),
        });
      },
    });
  }

  confirmarEliminar(u: UserListDto): void {
    this.confirmService.confirm({
      message: `¿Eliminar definitivamente al usuario <strong>${u.username}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.delete(u.id).subscribe({
          next: () => { this.notify.success('Usuario eliminado'); this.load(); },
          error: () => this.notify.error('No se pudo eliminar el usuario'),
        });
      },
    });
  }

  getRolLabel(role: UserRole): string {
    const map: Record<string, string> = {
      ADMIN:                'Admin',
      TECNICO_FARMACIA:     'Técnico',
      QUIMICO_FARMACEUTICO: 'Químico',
      JEFE_FARMACIA:        'Jefe Farm.',
      AUXILIAR_ALMACEN:     'Auxiliar',
    };
    return map[role] ?? role;
  }

  getRolSeverity(role: UserRole): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'info' | 'success' | 'warn' | 'danger' | 'secondary'> = {
      ADMIN:                'danger',
      TECNICO_FARMACIA:     'info',
      QUIMICO_FARMACEUTICO: 'success',
      JEFE_FARMACIA:        'warn',
      AUXILIAR_ALMACEN:     'secondary',
    };
    return map[role] ?? 'secondary';
  }

  private getMock(): UserListDto[] {
    return [
      { id: 1, username: 'jlopez',  nombres: 'Juan',   apellidoPaterno: 'López',  apellidoMaterno: 'Rios',   correoInstitucional: 'jlopez@hospital.gob.pe',  numeroDocumento: '11111111', estado: 'ACTIVO',   roles: ['TECNICO_FARMACIA'] },
      { id: 2, username: 'mrojas',  nombres: 'María',  apellidoPaterno: 'Rojas',  apellidoMaterno: 'Vega',   correoInstitucional: 'mrojas@hospital.gob.pe',  numeroDocumento: '22222222', estado: 'ACTIVO',   roles: ['QUIMICO_FARMACEUTICO'] },
      { id: 3, username: 'cperea',  nombres: 'Carlos', apellidoPaterno: 'Perea',  apellidoMaterno: 'Salas',  correoInstitucional: 'cperea@hospital.gob.pe',  numeroDocumento: '33333333', estado: 'INACTIVO', roles: ['JEFE_FARMACIA'] },
      { id: 4, username: 'lflores', nombres: 'Luis',   apellidoPaterno: 'Flores', apellidoMaterno: 'Torres', correoInstitucional: 'lflores@hospital.gob.pe', numeroDocumento: '44444444', estado: 'ACTIVO',   roles: ['AUXILIAR_ALMACEN'] },
    ];
  }
}
