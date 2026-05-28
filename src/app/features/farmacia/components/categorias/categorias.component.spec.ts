import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmationService } from 'primeng/api';

import { CategoriasComponent } from './categorias.component';
import { MedicamentoService } from '../../services/medicamento.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Categoria } from '../../models/farmacia.models';

describe('CategoriasComponent', () => {
  let component: CategoriasComponent;
  let fixture: ComponentFixture<CategoriasComponent>;
  let medicamentoSpy: jasmine.SpyObj<MedicamentoService>;
  let notifySpy: jasmine.SpyObj<NotificationService>;
  let confirmSpy: jasmine.SpyObj<ConfirmationService>;

  const mockCategorias: Categoria[] = [
    { id: 1, nombre: 'Analgésicos',  descripcion: 'Para el dolor' },
    { id: 2, nombre: 'Antibióticos', descripcion: 'Antimicrobiano' },
  ];

  beforeEach(async () => {
    medicamentoSpy = jasmine.createSpyObj('MedicamentoService', [
      'getCategorias', 'createCategoria', 'updateCategoria', 'deleteCategoria',
    ]);
    notifySpy  = jasmine.createSpyObj('NotificationService', ['success', 'error']);
    confirmSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    medicamentoSpy.getCategorias.and.returnValue(of(mockCategorias));

    await TestBed.configureTestingModule({
      imports: [CategoriasComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MedicamentoService, useValue: medicamentoSpy },
        { provide: NotificationService, useValue: notifySpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideComponent(CategoriasComponent, {
      set: {
        template: '',
        providers: [{ provide: ConfirmationService, useValue: confirmSpy }],
      },
    })
    .compileComponents();

    fixture   = TestBed.createComponent(CategoriasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loadCategorias — populates signal and clears loading on success', () => {
    expect(component.categorias()).toEqual(mockCategorias);
    expect(component.isLoading()).toBeFalse();
  });

  it('loadCategorias — falls back to mock data on HTTP error', () => {
    medicamentoSpy.getCategorias.and.returnValue(throwError(() => new Error('HTTP')));
    component.loadCategorias();
    expect(component.categorias().length).toBeGreaterThan(0);
    expect(component.isLoading()).toBeFalse();
  });

  it('abrirNueva — clears editingId, resets form, shows modal', () => {
    component.editingId.set(5);
    component.abrirNueva();
    expect(component.editingId()).toBeNull();
    expect(component.showModal()).toBeTrue();
    expect(component.form.value.nombre).toBeFalsy();
  });

  it('abrirEditar — patches form with category data and shows modal', () => {
    component.abrirEditar(mockCategorias[0]);
    expect(component.editingId()).toBe(1);
    expect(component.form.value.nombre).toBe('Analgésicos');
    expect(component.showModal()).toBeTrue();
  });

  it('onSubmit — marks form touched and skips service when form is invalid', () => {
    component.form.patchValue({ nombre: '' });
    component.onSubmit();
    expect(medicamentoSpy.createCategoria).not.toHaveBeenCalled();
    expect(medicamentoSpy.updateCategoria).not.toHaveBeenCalled();
  });

  it('onSubmit — calls createCategoria when editingId is null', fakeAsync(() => {
    medicamentoSpy.createCategoria.and.returnValue(of({ id: 3, nombre: 'Nueva' }));
    component.form.patchValue({ nombre: 'Nueva Cat', color: '#ffffff' });
    component.onSubmit();
    tick();
    expect(medicamentoSpy.createCategoria).toHaveBeenCalled();
    expect(notifySpy.success).toHaveBeenCalledWith('Categoría guardada');
    expect(component.showModal()).toBeFalse();
    expect(component.isSaving()).toBeFalse();
  }));

  it('onSubmit — calls updateCategoria when editingId is set', fakeAsync(() => {
    medicamentoSpy.updateCategoria.and.returnValue(of({ id: 1, nombre: 'Editado' }));
    component.editingId.set(1);
    component.form.patchValue({ nombre: 'Editado', color: '#ffffff' });
    component.onSubmit();
    tick();
    expect(medicamentoSpy.updateCategoria).toHaveBeenCalledWith(1, jasmine.any(Object));
    expect(notifySpy.success).toHaveBeenCalledWith('Categoría guardada');
  }));

  it('onSubmit — shows error notification and clears saving flag on service failure', fakeAsync(() => {
    medicamentoSpy.createCategoria.and.returnValue(throwError(() => new Error()));
    component.form.patchValue({ nombre: 'Nueva Cat', color: '#ffffff' });
    component.onSubmit();
    tick();
    expect(notifySpy.error).toHaveBeenCalledWith('Error al guardar categoría');
    expect(component.isSaving()).toBeFalse();
  }));

  it('confirmarEliminar — calls deleteCategoria and reloads on accept', fakeAsync(() => {
    confirmSpy.confirm.and.callFake((opts: any) => opts.accept?.());
    medicamentoSpy.deleteCategoria.and.returnValue(of(undefined));
    component.confirmarEliminar(mockCategorias[0]);
    tick();
    expect(medicamentoSpy.deleteCategoria).toHaveBeenCalledWith(1);
    expect(notifySpy.success).toHaveBeenCalledWith('Categoría eliminada');
    expect(medicamentoSpy.getCategorias).toHaveBeenCalledTimes(2); // ngOnInit + reload
  }));
});
