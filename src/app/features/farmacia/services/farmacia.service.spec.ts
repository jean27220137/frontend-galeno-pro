import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FarmaciaService } from './farmacia.service';
import { environment } from '../../../../environments/environment';

describe('FarmaciaService', () => {
  let service: FarmaciaService;
  let httpMock: HttpTestingController;
  const base = `${environment.farmaciaApiUrl}/farmacia`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), FarmaciaService],
    });
    service  = TestBed.inject(FarmaciaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll — GET /farmacia with page and size params', () => {
    service.getAll(0, 10).subscribe();
    const req = httpMock.expectOne(r => r.url === base);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush({ content: [], totalElements: 0 });
  });

  it('getById — GET /farmacia/:id', () => {
    service.getById(1).subscribe();
    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('create — POST /farmacia with full body', () => {
    const dto = { nombre: 'F1', codigo: 'F-01', direccion: 'Av 1', responsable: 'Juan', telefono: '999' };
    service.create(dto).subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush({ id: 1, ...dto, estado: 'ACTIVA' });
  });

  it('update — PUT /farmacia/:id', () => {
    service.update(2, { nombre: 'Farmacia Sur' }).subscribe();
    const req = httpMock.expectOne(`${base}/2`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nombre: 'Farmacia Sur' });
    req.flush({});
  });

  it('delete — DELETE /farmacia/:id', () => {
    service.delete(3).subscribe();
    const req = httpMock.expectOne(`${base}/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getResumen — includes farmaciaId param when provided', () => {
    service.getResumen(5).subscribe();
    const req = httpMock.expectOne(r => r.url === `${base}/resumen`);
    expect(req.request.params.get('farmaciaId')).toBe('5');
    req.flush({});
  });

  it('getResumen — no farmaciaId param when omitted', () => {
    service.getResumen().subscribe();
    const req = httpMock.expectOne(r => r.url === `${base}/resumen`);
    expect(req.request.params.has('farmaciaId')).toBeFalse();
    req.flush({});
  });
});
