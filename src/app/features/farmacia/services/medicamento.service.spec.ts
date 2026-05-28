import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MedicamentoService } from './medicamento.service';
import { environment } from '../../../../environments/environment';

describe('MedicamentoService', () => {
  let service: MedicamentoService;
  let httpMock: HttpTestingController;
  const base = `${environment.farmaciaApiUrl}/farmacia`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), MedicamentoService],
    });
    service  = TestBed.inject(MedicamentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getInventario ─────────────────────────────────────────────

  it('getInventario — default params, no search filter', () => {
    service.getInventario().subscribe();
    const req = httpMock.expectOne(r => r.url === `${base}/productos`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.has('search')).toBeFalse();
    req.flush({ content: [], totalElements: 0 });
  });

  it('getInventario — includes search param and custom page/size', () => {
    service.getInventario({ search: 'para' }, 2, 5).subscribe();
    const req = httpMock.expectOne(r => r.url === `${base}/productos`);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('5');
    expect(req.request.params.get('search')).toBe('para');
    req.flush({ content: [], totalElements: 0 });
  });

  it('getById — GET /productos/:id', () => {
    service.getById(7).subscribe(res => expect(res).toEqual({ id: 7 } as any));
    const req = httpMock.expectOne(`${base}/productos/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 7 });
  });

  // ── Categorías ────────────────────────────────────────────────

  it('getCategorias — GET /categorias returns list', () => {
    const mock = [{ id: 1, nombre: 'Analgésicos' }];
    service.getCategorias().subscribe(res => expect(res).toEqual(mock as any));
    const req = httpMock.expectOne(`${base}/categorias`);
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('createCategoria — POST /categorias with body', () => {
    service.createCategoria({ nombre: 'Nueva', descripcion: 'Desc' }).subscribe();
    const req = httpMock.expectOne(`${base}/categorias`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nombre: 'Nueva', descripcion: 'Desc' });
    req.flush({ id: 5, nombre: 'Nueva' });
  });

  it('updateCategoria — PUT /categorias/:id with body', () => {
    service.updateCategoria(3, { nombre: 'Edit' }).subscribe();
    const req = httpMock.expectOne(`${base}/categorias/3`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nombre: 'Edit' });
    req.flush({ id: 3, nombre: 'Edit' });
  });

  it('deleteCategoria — DELETE /categorias/:id', () => {
    service.deleteCategoria(4).subscribe();
    const req = httpMock.expectOne(`${base}/categorias/4`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ── Lotes ─────────────────────────────────────────────────────

  it('getLotes — includes productoId param when provided', () => {
    service.getLotes(5).subscribe();
    const req = httpMock.expectOne(r => r.url === `${base}/lotes`);
    expect(req.request.params.get('productoId')).toBe('5');
    req.flush([]);
  });

  it('getLotes — no productoId param when omitted', () => {
    service.getLotes().subscribe();
    const req = httpMock.expectOne(r => r.url === `${base}/lotes`);
    expect(req.request.params.has('productoId')).toBeFalse();
    req.flush([]);
  });

  it('getLoteById — GET /lotes/:id', () => {
    service.getLoteById(10).subscribe();
    const req = httpMock.expectOne(`${base}/lotes/10`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  // ── Movimientos ───────────────────────────────────────────────

  it('registrarEntrada — POST /movimientos/entradas', () => {
    service.registrarEntrada({ detalles: [] }).subscribe();
    const req = httpMock.expectOne(`${base}/movimientos/entradas`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('registrarSalida — POST /movimientos/salidas', () => {
    service.registrarSalida({ detalles: [] }).subscribe();
    const req = httpMock.expectOne(`${base}/movimientos/salidas`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('getMovimientos — includes tipo param when provided', () => {
    service.getMovimientos('ENTRADA').subscribe();
    const req = httpMock.expectOne(r => r.url === `${base}/movimientos`);
    expect(req.request.params.get('tipo')).toBe('ENTRADA');
    req.flush({ content: [], totalElements: 0 });
  });

  it('getMovimientos — no tipo param when omitted', () => {
    service.getMovimientos().subscribe();
    const req = httpMock.expectOne(r => r.url === `${base}/movimientos`);
    expect(req.request.params.has('tipo')).toBeFalse();
    req.flush({ content: [], totalElements: 0 });
  });

  it('getMovimientoById — GET /movimientos/:id', () => {
    service.getMovimientoById(1).subscribe();
    const req = httpMock.expectOne(`${base}/movimientos/1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  // ── Alertas ───────────────────────────────────────────────────

  it('getAlertasStockBajo — GET /alertas/stock-bajo', () => {
    service.getAlertasStockBajo().subscribe();
    const req = httpMock.expectOne(`${base}/alertas/stock-bajo`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getAlertasPorVencer — GET /alertas/por-vencer', () => {
    service.getAlertasPorVencer().subscribe();
    const req = httpMock.expectOne(`${base}/alertas/por-vencer`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getAlertasVencidos — GET /alertas/vencidos', () => {
    service.getAlertasVencidos().subscribe();
    const req = httpMock.expectOne(`${base}/alertas/vencidos`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
