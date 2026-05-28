import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Farmacia,
  CreateFarmaciaDto,
  ResumenFarmacia,
} from '../models/farmacia.models';
import { PagedResponse } from '../../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class FarmaciaService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.farmaciaApiUrl}/farmacia`;

  // ── CRUD Farmacias (endpoint aún no implementado → mock en componente) ──

  getAll(page = 0, size = 10): Observable<PagedResponse<Farmacia>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PagedResponse<Farmacia>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Farmacia> {
    return this.http.get<Farmacia>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateFarmaciaDto): Observable<Farmacia> {
    return this.http.post<Farmacia>(this.baseUrl, dto);
  }

  update(id: number, dto: Partial<CreateFarmaciaDto>): Observable<Farmacia> {
    return this.http.put<Farmacia>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ── Dashboard (endpoint aún no implementado → mock en componente) ──

  getResumen(farmaciaId?: number): Observable<ResumenFarmacia> {
    const params = farmaciaId
      ? new HttpParams().set('farmaciaId', farmaciaId)
      : new HttpParams();
    return this.http.get<ResumenFarmacia>(`${this.baseUrl}/resumen`, { params });
  }
}
