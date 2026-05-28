import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AlertasComponent } from './alertas.component';
import { MedicamentoService } from '../../services/medicamento.service';
import { AlertaLote } from '../../models/farmacia.models';

describe('AlertasComponent', () => {
  let component: AlertasComponent;
  let fixture: ComponentFixture<AlertasComponent>;
  let medicamentoSpy: jasmine.SpyObj<MedicamentoService>;

  const loteVencido: AlertaLote = {
    loteId: 1, productoId: 1, nombreProducto: 'Med A',
    numeroLote: 'L-001', fechaVencimiento: '2024-01-01',
    cantidadDisponible: 50, estado: 'VENCIDO', diasParaVencer: -120,
  };
  const loteCritico: AlertaLote = {
    loteId: 2, productoId: 2, nombreProducto: 'Med B',
    numeroLote: 'L-002', fechaVencimiento: '2026-06-15',
    cantidadDisponible: 100, estado: 'ACTIVO' as any, diasParaVencer: 20,
  };
  const loteProximo: AlertaLote = {
    loteId: 3, productoId: 3, nombreProducto: 'Med C',
    numeroLote: 'L-003', fechaVencimiento: '2026-09-01',
    cantidadDisponible: 200, estado: 'ACTIVO' as any, diasParaVencer: 60,
  };

  beforeEach(async () => {
    medicamentoSpy = jasmine.createSpyObj('MedicamentoService', [
      'getAlertasPorVencer', 'getAlertasVencidos',
    ]);
    medicamentoSpy.getAlertasPorVencer.and.returnValue(of([loteCritico, loteProximo]));
    medicamentoSpy.getAlertasVencidos.and.returnValue(of([loteVencido]));

    await TestBed.configureTestingModule({
      imports: [AlertasComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MedicamentoService, useValue: medicamentoSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideComponent(AlertasComponent, { set: { template: '' } })
    .compileComponents();

    fixture   = TestBed.createComponent(AlertasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit — combines porVencer and vencidos into allLotes', () => {
    expect(component.allLotes().length).toBe(3);
    expect(component.isLoading()).toBeFalse();
  });

  it('ngOnInit — falls back to getMockAlertas on forkJoin error', () => {
    medicamentoSpy.getAlertasPorVencer.and.returnValue(throwError(() => new Error()));
    component.allLotes.set([]);
    component.ngOnInit();
    expect(component.allLotes().length).toBeGreaterThan(0);
    expect(component.isLoading()).toBeFalse();
  });

  // ── Computed signals ──────────────────────────────────────────

  it('vencidos — contains only lotes with estado VENCIDO', () => {
    expect(component.vencidos()).toEqual([loteVencido]);
  });

  it('criticos — contains non-vencidos with diasParaVencer <= 30', () => {
    expect(component.criticos()).toEqual([loteCritico]);
  });

  it('proximos — contains non-vencidos with diasParaVencer > 30', () => {
    expect(component.proximos()).toEqual([loteProximo]);
  });

  // ── getDiasRestantes ──────────────────────────────────────────

  it('getDiasRestantes — returns positive value for a future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const dateStr = future.toISOString().split('T')[0];
    const dias = component.getDiasRestantes(dateStr);
    expect(dias).toBeGreaterThanOrEqual(9);
    expect(dias).toBeLessThanOrEqual(11);
  });

  it('getDiasRestantes — returns negative value for a past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const dateStr = past.toISOString().split('T')[0];
    expect(component.getDiasRestantes(dateStr)).toBeLessThan(0);
  });

  // ── getSeverityEstado ─────────────────────────────────────────

  it('getSeverityEstado — returns danger for VENCIDO', () => {
    expect(component.getSeverityEstado('VENCIDO')).toBe('danger');
  });

  it('getSeverityEstado — returns warn for AGOTADO', () => {
    expect(component.getSeverityEstado('AGOTADO')).toBe('warn');
  });

  it('getSeverityEstado — returns success for ACTIVO/VIGENTE', () => {
    expect(component.getSeverityEstado('ACTIVO' as any)).toBe('success');
  });
});
