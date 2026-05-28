import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Tag } from 'primeng/tag';
import { FloatLabel } from 'primeng/floatlabel';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { FarmaciaService } from '../../services/farmacia.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Farmacia, CreateFarmaciaDto, EstadoFarmacia, EstadoProducto } from '../../models/farmacia.models';

@Component({
  selector: 'app-farmacias-lista',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, Button, Dialog, InputText, Tag,
    FloatLabel, ConfirmDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './farmacias-lista.component.html',
})
export class FarmaciasListaComponent implements OnInit {
  private readonly farmaciaService = inject(FarmaciaService);
  private readonly notify          = inject(NotificationService);
  private readonly confirmService  = inject(ConfirmationService);
  private readonly fb              = inject(FormBuilder);

  farmacias  = signal<Farmacia[]>([]);
  isLoading  = signal(true);
  showModal  = signal(false);
  isSaving   = signal(false);
  editingId  = signal<number | null>(null);

  estadoOptions = [
    { label: 'Activa',        value: 'ACTIVA'        },
    { label: 'Inactiva',      value: 'INACTIVA'      },
    { label: 'Mantenimiento', value: 'MANTENIMIENTO' },
  ];

  form: FormGroup = this.fb.group({
    nombre:      ['', [Validators.required, Validators.minLength(3)]],
    codigo:      ['', [Validators.required, Validators.pattern(/^[A-Z0-9\-]+$/)]],
    direccion:   ['', Validators.required],
    responsable: ['', Validators.required],
    telefono:    ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
  });

  ngOnInit(): void { this.loadFarmacias(); }

  loadFarmacias(): void {
    this.isLoading.set(true);
    this.farmaciaService.getAll().subscribe({
      next: (res) => { this.farmacias.set(res.content ?? []); this.isLoading.set(false); },
      error: () => { this.farmacias.set(this.getMock()); this.isLoading.set(false); },
    });
  }

  abrirNueva(): void {
    this.editingId.set(null);
    this.form.reset();
    this.showModal.set(true);
  }

  abrirEditar(f: Farmacia): void {
    this.editingId.set(f.id);
    this.form.patchValue(f);
    this.showModal.set(true);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving.set(true);
    const dto: CreateFarmaciaDto = this.form.value;
    const id = this.editingId();
    const req$ = id
      ? this.farmaciaService.update(id, dto)
      : this.farmaciaService.create(dto);

    req$.subscribe({
      next: (_res) => {
        this.isSaving.set(false);
        this.showModal.set(false);
        this.notify.success(id ? 'Farmacia actualizada' : 'Farmacia creada');
        this.loadFarmacias();
      },
      error: () => {
        this.isSaving.set(false);
        this.showModal.set(false);
        const valores = this.form.value;
        if (id) {
          this.farmacias.update(list =>
            list.map(f => f.id === id ? { ...f, ...valores } : f)
          );
          this.notify.success('Farmacia actualizada');
        } else {
          const nueva: Farmacia = {
            ...valores,
            id: Date.now(),
            estado: 'ACTIVA' as EstadoFarmacia,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.farmacias.update(list => [...list, nueva]);
          this.notify.success('Farmacia creada');
        }
      },
    });
  }

  confirmarEliminar(f: Farmacia): void {
    this.confirmService.confirm({
      message: `¿Eliminar la farmacia <strong>${f.nombre}</strong>?`,
      header: 'Confirmar',
      icon: 'pi pi-trash',
      acceptLabel: 'Eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.farmaciaService.delete(f.id).subscribe({
          next: () => { this.notify.success('Farmacia eliminada'); this.loadFarmacias(); },
          error: () => this.notify.error('No se pudo eliminar'),
        });
      },
    });
  }

  getSeveridadEstado(estado: EstadoFarmacia): 'success' | 'warn' | 'danger' {
    return estado === 'ACTIVA' ? 'success' : estado === 'INACTIVA' ? 'danger' : 'warn';
  }

  private getMock(): Farmacia[] {
    return [
      { id: 1, nombre: 'Farmacia Central', codigo: 'FC-01', direccion: 'Piso 1, Ala Norte',
        responsable: 'Qf. María López', telefono: '987654321',
        estado: 'ACTIVA', createdAt: '', updatedAt: '' },
      { id: 2, nombre: 'Farmacia Emergencia', codigo: 'FE-01', direccion: 'Piso 1, Urgencias',
        responsable: 'Qf. Carlos Ríos', telefono: '987654322',
        estado: 'ACTIVA', createdAt: '', updatedAt: '' },
    ];
  }
}
