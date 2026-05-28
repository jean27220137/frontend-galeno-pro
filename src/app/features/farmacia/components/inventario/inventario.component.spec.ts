import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { InventarioComponent } from './inventario.component';
import { MedicamentoService } from '../../services/medicamento.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Producto, Medicamento } from '../../models/farmacia.models';

describe('InventarioComponent', () => {
  let component: InventarioComponent;
  let fixture: ComponentFixture<InventarioComponent>;
  let medicamentoSpy: jasmine.SpyObj<MedicamentoService>;
  let notifySpy: jasmine.SpyObj<NotificationService>;

  const mockProducto: Producto = {
    id: 1, codigo: 'MED-001', nombre: 'Paracetamol 500mg',
    stockActual: 200, stockMinimo: 50, estado: 'ACTIVO',
  };

  beforeEach(async () => {
    medicamentoSpy = jasmine.createSpyObj('MedicamentoService', ['getInventario', 'getCategorias']);
    medicamentoSpy.getInventario.and.returnValue(
      of({ content: [mockProducto], totalElements: 1 } as any),
    );
    medicamentoSpy.getCategorias.and.returnValue(of([]));

    notifySpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [InventarioComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MedicamentoService, useValue: medicamentoSpy },
        { provide: NotificationService, useValue: notifySpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideComponent(InventarioComponent, { set: { template: '' } })
    .compileComponents();

    fixture   = TestBed.createComponent(InventarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit → startWith('') → loadPage(0)
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loadPage — sets medicamentos and totalRecords on success', () => {
    expect(component.medicamentos()).toEqual([mockProducto]);
    expect(component.totalRecords()).toBe(1);
    expect(component.isLoading()).toBeFalse();
  });

  it('loadPage — falls back to mock data on HTTP error', () => {
    medicamentoSpy.getInventario.and.returnValue(throwError(() => new Error()));
    component.loadPage(0);
    expect(component.medicamentos().length).toBeGreaterThan(0);
    expect(component.isLoading()).toBeFalse();
  });

  it('onPageChange — calls getInventario with correct page number', () => {
    medicamentoSpy.getInventario.and.returnValue(of({ content: [], totalElements: 0 } as any));
    component.onPageChange({ first: 20, rows: 20 });
    expect(medicamentoSpy.getInventario).toHaveBeenCalledWith(jasmine.any(Object), 1, 20);
  });

  it('onLimpiarFiltros — resets all filters then reloads', () => {
    component.searchText   = 'test';
    component.filtroAlerta = 'PROXIMO';
    component.filtroEstado = 'ACTIVO';
    medicamentoSpy.getInventario.and.returnValue(of({ content: [], totalElements: 0 } as any));
    component.onLimpiarFiltros();
    expect(component.searchText).toBe('');
    expect(component.filtroAlerta).toBeNull();
    expect(component.filtroEstado).toBeNull();
    expect(medicamentoSpy.getInventario).toHaveBeenCalledTimes(2); // init + limpiar
  });

  it('onFilterChange — calls loadPage with page 0', () => {
    medicamentoSpy.getInventario.and.returnValue(of({ content: [], totalElements: 0 } as any));
    component.onFilterChange();
    expect(medicamentoSpy.getInventario).toHaveBeenCalledTimes(2); // init + filterChange
  });

  // ── getSeverityAlerta ─────────────────────────────────────────

  it('getSeverityAlerta — returns info for undefined', () => {
    expect(component.getSeverityAlerta(undefined)).toBe('info');
  });

  it('getSeverityAlerta — returns correct severity for each alert type', () => {
    expect(component.getSeverityAlerta('OK')).toBe('success');
    expect(component.getSeverityAlerta('PROXIMO')).toBe('warn');
    expect(component.getSeverityAlerta('CRITICO')).toBe('danger');
    expect(component.getSeverityAlerta('VENCIDO')).toBe('danger');
  });

  // ── getLabelAlerta ────────────────────────────────────────────

  it('getLabelAlerta — returns "Sin alerta" for undefined', () => {
    expect(component.getLabelAlerta(undefined)).toBe('Sin alerta');
  });

  it('getLabelAlerta — returns correct label for each alert type', () => {
    expect(component.getLabelAlerta('OK')).toBe('Vigente');
    expect(component.getLabelAlerta('PROXIMO')).toBe('Próx. Vencer');
    expect(component.getLabelAlerta('CRITICO')).toBe('Crítico');
    expect(component.getLabelAlerta('VENCIDO')).toBe('Vencido');
  });

  // ── getRowClass ───────────────────────────────────────────────

  it('getRowClass — warning class when stockActual <= stockMinimo', () => {
    const low: Producto = { ...mockProducto, stockActual: 50, stockMinimo: 50 };
    expect(component.getRowClass(low)).toBe('stock-row-warning');
  });

  it('getRowClass — ok class when stockActual > stockMinimo', () => {
    expect(component.getRowClass(mockProducto)).toBe('stock-row-ok');
  });

  // ── getStockPct ───────────────────────────────────────────────

  it('getStockPct — calculates percentage against stockMaximo', () => {
    const med = { ...mockProducto, stockActual: 50, stockMaximo: 500 } as Medicamento;
    expect(component.getStockPct(med)).toBe(10);
  });

  it('getStockPct — caps at 100 when stock exceeds maximum', () => {
    const med = { ...mockProducto, stockActual: 600, stockMaximo: 500 } as Medicamento;
    expect(component.getStockPct(med)).toBe(100);
  });

  it('getStockPct — uses stockMinimo * 3 when stockMaximo is absent', () => {
    const med: Producto = { ...mockProducto, stockActual: 60, stockMinimo: 50 };
    // max = 50 * 3 = 150 → pct = 60/150*100 = 40
    expect(component.getStockPct(med)).toBeCloseTo(40);
  });

  // ── getStockColor ─────────────────────────────────────────────

  it('getStockColor — returns red when pct < 20', () => {
    const med = { ...mockProducto, stockActual: 5, stockMinimo: 10, stockMaximo: 500 } as Medicamento;
    expect(component.getStockColor(med)).toBe('#ef4444');
  });

  it('getStockColor — returns amber when 20 <= pct < 40', () => {
    const med = { ...mockProducto, stockActual: 100, stockMinimo: 10, stockMaximo: 500 } as Medicamento;
    expect(component.getStockColor(med)).toBe('#f59e0b');
  });

  it('getStockColor — returns green when pct >= 40', () => {
    const med = { ...mockProducto, stockActual: 300, stockMinimo: 10, stockMaximo: 500 } as Medicamento;
    expect(component.getStockColor(med)).toBe('#10b981');
  });

  // ── onSearchChange ────────────────────────────────────────────

  it('onSearchChange — does not call service immediately, calls after debounce', fakeAsync(() => {
    medicamentoSpy.getInventario.calls.reset();
    component.onSearchChange('paracetamol');
    expect(medicamentoSpy.getInventario).not.toHaveBeenCalled();
    tick(350);
    expect(medicamentoSpy.getInventario).toHaveBeenCalledTimes(1);
  }));
});
