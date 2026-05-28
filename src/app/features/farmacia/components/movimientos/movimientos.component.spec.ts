import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { MovimientosComponent } from './movimientos.component';
import { MedicamentoService } from '../../services/medicamento.service';
import { Movimiento, TipoMovimiento } from '../../models/farmacia.models';

const makeMovPage = (overrides: Partial<Movimiento> = {}) => ({
  content: [{
    id: 1,
    tipoMovimiento: 'ENTRADA' as TipoMovimiento,
    fecha: '2026-05-27T10:00:00',
    usuarioId: 'admin',
    observacion: 'Compra proveedor',
    detalles: [{ id: 1, productoId: 1, nombreProducto: 'Paracetamol', loteId: 1, numeroLote: 'L-001', cantidad: 100, precioUnitario: 0.15 }],
    ...overrides,
  }],
  totalElements: 1,
});

describe('MovimientosComponent', () => {
  let component: MovimientosComponent;
  let fixture: ComponentFixture<MovimientosComponent>;
  let medicamentoSpy: jasmine.SpyObj<MedicamentoService>;

  beforeEach(async () => {
    medicamentoSpy = jasmine.createSpyObj('MedicamentoService', ['getMovimientos']);
    medicamentoSpy.getMovimientos.and.returnValue(of(makeMovPage() as any));

    await TestBed.configureTestingModule({
      imports: [MovimientosComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MedicamentoService, useValue: medicamentoSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideComponent(MovimientosComponent, { set: { template: '' } })
    .compileComponents();

    fixture   = TestBed.createComponent(MovimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loadPage — sets movimientos and totalRecords on success', () => {
    expect(component.movimientos().length).toBe(1);
    expect(component.totalRecords()).toBe(1);
    expect(component.isLoading()).toBeFalse();
  });

  it('loadPage — falls back to mock data on HTTP error', () => {
    medicamentoSpy.getMovimientos.and.returnValue(throwError(() => new Error()));
    component.loadPage(0);
    expect(component.movimientos().length).toBeGreaterThan(0);
    expect(component.isLoading()).toBeFalse();
  });

  it('onPageChange — updates first/rows and calls loadPage', () => {
    spyOn(component, 'loadPage');
    component.onPageChange({ first: 20, rows: 20 });
    expect(component.first).toBe(20);
    expect(component.rows).toBe(20);
    expect(component.loadPage).toHaveBeenCalledWith(1);
  });

  it('onFilterChange — calls loadPage(0)', () => {
    spyOn(component, 'loadPage');
    component.onFilterChange();
    expect(component.loadPage).toHaveBeenCalledWith(0);
  });

  // ── totalCantidad ─────────────────────────────────────────────

  it('totalCantidad — sums all detalles quantities', () => {
    const mov: Movimiento = {
      id: 1, tipoMovimiento: 'ENTRADA', fecha: '', usuarioId: 'x',
      detalles: [
        { id: 1, productoId: 1, nombreProducto: 'A', loteId: 1, numeroLote: 'L1', cantidad: 50, precioUnitario: 1 },
        { id: 2, productoId: 2, nombreProducto: 'B', loteId: 2, numeroLote: 'L2', cantidad: 30, precioUnitario: 2 },
      ],
    };
    expect(component.totalCantidad(mov)).toBe(80);
  });

  it('totalCantidad — returns 0 for empty detalles', () => {
    const mov: Movimiento = { id: 1, tipoMovimiento: 'SALIDA', fecha: '', usuarioId: 'x', detalles: [] };
    expect(component.totalCantidad(mov)).toBe(0);
  });

  // ── getSeverity ───────────────────────────────────────────────

  it('getSeverity — returns correct severity for each tipo', () => {
    expect(component.getSeverity('ENTRADA')).toBe('success');
    expect(component.getSeverity('SALIDA')).toBe('danger');
    expect(component.getSeverity('AJUSTE')).toBe('info');
    expect(component.getSeverity('DEVOLUCION')).toBe('warn');
    expect(component.getSeverity('TRASLADO')).toBe('info');
  });

  it('getSeverity — defaults to info for unknown tipo', () => {
    expect(component.getSeverity('UNKNOWN' as TipoMovimiento)).toBe('info');
  });

  // ── getIcon ───────────────────────────────────────────────────

  it('getIcon — returns correct icon for each tipo', () => {
    expect(component.getIcon('ENTRADA')).toBe('pi pi-arrow-down-circle');
    expect(component.getIcon('SALIDA')).toBe('pi pi-arrow-up-circle');
    expect(component.getIcon('AJUSTE')).toBe('pi pi-cog');
    expect(component.getIcon('DEVOLUCION')).toBe('pi pi-undo');
    expect(component.getIcon('TRASLADO')).toBe('pi pi-arrows-h');
  });

  it('getIcon — defaults to pi pi-circle for unknown tipo', () => {
    expect(component.getIcon('UNKNOWN' as TipoMovimiento)).toBe('pi pi-circle');
  });
});
