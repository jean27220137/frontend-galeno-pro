import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { FloatLabel } from 'primeng/floatlabel';
import { ColorPicker } from 'primeng/colorpicker';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MedicamentoService } from '../../services/medicamento.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Categoria, CategoriaMedicamento } from '../../models/farmacia.models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    TableModule, Button, Dialog, InputText, Textarea,
    FloatLabel, ColorPicker, ConfirmDialog,
  ],
  providers: [ConfirmationService],
  templateUrl: './categorias.component.html',
})
export class CategoriasComponent implements OnInit {
  private readonly medicamentoService = inject(MedicamentoService);
  private readonly notify             = inject(NotificationService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb                 = inject(FormBuilder);

  categorias    = signal<Categoria[]>([]);
  isLoading     = signal(true);
  showModal     = signal(false);
  isSaving      = signal(false);
  editingId     = signal<number | null>(null);

  form: FormGroup = this.fb.group({
    nombre:      ['', [Validators.required, Validators.minLength(2)]],
    descripcion: [''],
    color:       ['#2378f0', Validators.required],
    icono:       ['pi pi-box'],
  });

  ngOnInit(): void { this.loadCategorias(); }

  loadCategorias(): void {
    this.isLoading.set(true);
    this.medicamentoService.getCategorias().subscribe({
      next: (res) => { this.categorias.set(res); this.isLoading.set(false); },
      error: () => { this.categorias.set(this.getMock()); this.isLoading.set(false); },
    });
  }

  abrirNueva(): void {
    this.editingId.set(null);
    this.form.reset({ color: '#2378f0', icono: 'pi pi-box' });
    this.showModal.set(true);
  }

  abrirEditar(cat: Categoria): void {
    this.editingId.set(cat.id);
    this.form.patchValue(cat);
    this.showModal.set(true);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSaving.set(true);
    const id = this.editingId();
    const req$ = id
      ? this.medicamentoService.updateCategoria(id, this.form.value)
      : this.medicamentoService.createCategoria(this.form.value);

    req$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showModal.set(false);
        this.notify.success('Categoría guardada');
        this.loadCategorias();
      },
      error: () => {
        this.isSaving.set(false);
        this.notify.error('Error al guardar categoría');
      },
    });
  }

  confirmarEliminar(cat: Categoria): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la categoría <strong>${cat.nombre}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.medicamentoService.deleteCategoria(cat.id).subscribe({
          next: () => { this.notify.success('Categoría eliminada'); this.loadCategorias(); },
          error: () => this.notify.error('No se pudo eliminar la categoría'),
        });
      },
    });
  }

  private getMock(): CategoriaMedicamento[] {
    return [
      { id: 1, nombre: 'Analgésicos',    descripcion: 'Medicamentos para el dolor', color: '#2378f0', icono: 'pi pi-box', totalMedicamentos: 45 },
      { id: 2, nombre: 'Antibióticos',   descripcion: 'Agentes antimicrobianos',     color: '#00bcd4', icono: 'pi pi-box', totalMedicamentos: 30 },
      { id: 3, nombre: 'Vitaminas',      descripcion: 'Suplementos vitamínicos',     color: '#10b981', icono: 'pi pi-box', totalMedicamentos: 25 },
      { id: 4, nombre: 'Cardiovascular', descripcion: 'Sistema cardiovascular',      color: '#ef4444', icono: 'pi pi-box', totalMedicamentos: 18 },
    ];
  }
}
