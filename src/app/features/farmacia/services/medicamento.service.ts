import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Categoria,
  Producto,
  Lote,
  Movimiento,
  AlertaStock,
  AlertaLote,
  EntradaRequest,
  SalidaRequest,
  FiltroInventario,
  DatoGraficoMovimientos,
  DatoGraficoCategorias,
  CreateMovimientoDto,
  ProductoRequest,
} from '../models/farmacia.models';
import { PagedResponse } from '../../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class MedicamentoService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.farmaciaApiUrl}/farmacia`;

  // ── Productos / Inventario ────────────────────────────────────

  getInventario(
    filtros: FiltroInventario = {},
    page = 0,
    size = 10,
  ): Observable<PagedResponse<Producto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (filtros.search) params = params.set('search', filtros.search);
    return this.http.get<PagedResponse<Producto>>(`${this.baseUrl}/productos`, { params });
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/productos/${id}`);
  }

  createProducto(dto: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/productos`, dto);
  }

  updateProducto(id: number, dto: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/productos/${id}`, dto);
  }

  // ── Categorías ────────────────────────────────────────────────

  getCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.baseUrl}/categorias`);
  }

  createCategoria(dto: { nombre: string; descripcion?: string }): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.baseUrl}/categorias`, dto);
  }

  updateCategoria(id: number, dto: { nombre: string; descripcion?: string }): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.baseUrl}/categorias/${id}`, dto);
  }

  deleteCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categorias/${id}`);
  }

  // ── Lotes ─────────────────────────────────────────────────────

  getLotes(productoId?: number): Observable<Lote[]> {
    let params = new HttpParams();
    if (productoId != null) params = params.set('productoId', productoId);
    return this.http.get<Lote[]>(`${this.baseUrl}/lotes`, { params });
  }

  getLoteById(id: number): Observable<Lote> {
    return this.http.get<Lote>(`${this.baseUrl}/lotes/${id}`);
  }

  // ── Movimientos ───────────────────────────────────────────────

  registrarEntrada(dto: EntradaRequest): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.baseUrl}/movimientos/entradas`, dto);
  }

  registrarSalida(dto: SalidaRequest): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.baseUrl}/movimientos/salidas`, dto);
  }

  getMovimientos(
    tipo?: string,
    page = 0,
    size = 10,
  ): Observable<PagedResponse<Movimiento>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (tipo) params = params.set('tipo', tipo);
    return this.http.get<PagedResponse<Movimiento>>(`${this.baseUrl}/movimientos`, { params });
  }

  getMovimientoById(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.baseUrl}/movimientos/${id}`);
  }

  // ── Alertas ───────────────────────────────────────────────────

  getAlertasStockBajo(): Observable<AlertaStock[]> {
    return this.http.get<AlertaStock[]>(`${this.baseUrl}/alertas/stock-bajo`);
  }

  getAlertasPorVencer(): Observable<AlertaLote[]> {
    return this.http.get<AlertaLote[]>(`${this.baseUrl}/alertas/por-vencer`);
  }

  getAlertasVencidos(): Observable<AlertaLote[]> {
    return this.http.get<AlertaLote[]>(`${this.baseUrl}/alertas/vencidos`);
  }

  // ── Legacy (llamados por componentes existentes) ──────────────

  getMedicamentosAlertaVencimiento(): Observable<AlertaLote[]> {
    return this.http.get<AlertaLote[]>(`${this.baseUrl}/alertas/por-vencer`);
  }

  // Mantenido para backward compat; el form de movimientos necesita rediseño
  registrarMovimiento(_dto: CreateMovimientoDto): Observable<Movimiento> {
    return this.http.post<Movimiento>(`${this.baseUrl}/movimientos/entradas`, { detalles: [] });
  }

  // Endpoints no implementados aún; los componentes usan mock en el error handler
  getGraficoMovimientos(_farmaciaId?: number, _dias = 7): Observable<DatoGraficoMovimientos[]> {
    return this.http.get<DatoGraficoMovimientos[]>(`${this.baseUrl}/estadisticas/movimientos`);
  }

  getGraficoCategorias(_farmaciaId?: number): Observable<DatoGraficoCategorias[]> {
    return this.http.get<DatoGraficoCategorias[]>(`${this.baseUrl}/estadisticas/categorias`);
  }
}
