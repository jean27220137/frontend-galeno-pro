import {
  Component, OnInit, inject, signal,
  AfterViewInit, OnDestroy, ElementRef, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressBar } from 'primeng/progressbar';
import { Skeleton } from 'primeng/skeleton';
import { Chart, registerables } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { MedicamentoService } from '../../services/medicamento.service';
import { ResumenFarmacia, DatoGraficoMovimientos, DatoGraficoCategorias, Movimiento } from '../../models/farmacia.models';

Chart.register(...registerables);

@Component({
  selector: 'app-farmacia-dashboard',
  standalone: true,
  imports: [CommonModule, ProgressBar, Skeleton],
  templateUrl: './farmacia-dashboard.component.html',
})
export class FarmaciaDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly medicamentoService = inject(MedicamentoService);

  @ViewChild('movimientosChart', { static: false }) movimientosChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoriasChart',  { static: false }) categoriasChartRef!: ElementRef<HTMLCanvasElement>;

  resumen   = signal<ResumenFarmacia | null>(null);
  isLoading = signal(true);
  readonly today = new Date();

  private movimientosChartInstance?: Chart;
  private categoriasChartInstance?: Chart;

  get kpiCards() {
    const r = this.resumen();
    if (!r) return [];
    return [
      { label: 'Total Medicamentos', value: r.totalMedicamentos, icon: 'pi pi-box',                    color: '#2378f0', bg: '#e8f0fe', suffix: '' },
      { label: 'Stock Bajo',         value: r.stockBajo,         icon: 'pi pi-exclamation-triangle',   color: '#f59e0b', bg: '#fef9c3', suffix: '' },
      { label: 'Próximos a Vencer',  value: r.proximosVencer,    icon: 'pi pi-clock',                  color: '#f97316', bg: '#fff7ed', suffix: '' },
      { label: 'Vencidos',           value: r.vencidos,          icon: 'pi pi-times-circle',           color: '#ef4444', bg: '#fee2e2', suffix: '' },
      { label: 'Movimientos Hoy',    value: r.totalMovimientosHoy,icon:'pi pi-arrow-right-arrow-left', color: '#00bcd4', bg: '#e0f7fa', suffix: '' },
      { label: 'Valor Inventario',   value: r.valorTotalInventario,icon:'pi pi-dollar',                color: '#10b981', bg: '#dcfce7', suffix: 'S/.', isMoneda: true },
    ];
  }

  ngOnInit(): void { this.loadDashboard(); }
  ngAfterViewInit(): void {}
  ngOnDestroy(): void {
    this.movimientosChartInstance?.destroy();
    this.categoriasChartInstance?.destroy();
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    const today = new Date().toDateString();

    forkJoin({
      productos:      this.medicamentoService.getInventario({}, 0, 1).pipe(catchError(() => of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 0, first: true, last: true }))),
      stockBajo:      this.medicamentoService.getAlertasStockBajo().pipe(catchError(() => of([]))),
      porVencer:      this.medicamentoService.getAlertasPorVencer().pipe(catchError(() => of([]))),
      vencidos:       this.medicamentoService.getAlertasVencidos().pipe(catchError(() => of([]))),
      movimientos:    this.medicamentoService.getMovimientos(undefined, 0, 500).pipe(catchError(() => of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 0, first: true, last: true }))),
      todosProductos: this.medicamentoService.getInventario({}, 0, 200).pipe(catchError(() => of({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 0, first: true, last: true }))),
    }).subscribe({
      next: (data) => {
        const movsHoy = data.movimientos.content.filter(m =>
          new Date(m.fecha).toDateString() === today
        );
        const entradasHoy = movsHoy.filter(m => m.tipoMovimiento === 'ENTRADA').length;
        const salidasHoy  = movsHoy.filter(m => m.tipoMovimiento === 'SALIDA').length;

        const valorInventario = data.todosProductos.content.reduce((sum, p) =>
          sum + (p.stockActual * (p.precioUnitario ?? 0)), 0
        );

        this.resumen.set({
          totalMedicamentos:    data.productos.totalElements,
          stockBajo:            data.stockBajo.length,
          proximosVencer:       data.porVencer.length,
          vencidos:             data.vencidos.length,
          totalMovimientosHoy:  movsHoy.length,
          entradasHoy,
          salidasHoy,
          valorTotalInventario: valorInventario,
        });

        this.isLoading.set(false);
        setTimeout(() => this.loadGraficos(data.movimientos.content, data.todosProductos.content), 0);
      },
      error: () => {
        this.resumen.set(this.getMockResumen());
        this.isLoading.set(false);
        setTimeout(() => this.loadGraficosConMock(), 0);
      },
    });
  }

  private loadGraficos(movimientos: Movimiento[], productos: any[]): void {
    // Gráfico movimientos: agrupar por día (últimos 7 días)
    const dias = this.getUltimos7Dias();
    const movData: DatoGraficoMovimientos[] = dias.map(({ label, dateStr }) => {
      const del_dia = movimientos.filter(m => new Date(m.fecha).toDateString() === dateStr);
      return {
        fecha:    label,
        entradas: del_dia.filter(m => m.tipoMovimiento === 'ENTRADA').length,
        salidas:  del_dia.filter(m => m.tipoMovimiento === 'SALIDA').length,
      };
    });
    this.renderMovimientosChart(movData);

    // Gráfico categorías: agrupar productos por categoría
    const colores = ['#2378f0','#00bcd4','#10b981','#f59e0b','#f97316','#ef4444','#8b5cf6','#ec4899'];
    const porCategoria: Record<string, number> = {};
    productos.forEach(p => {
      const cat = p.categoria?.nombre ?? 'Sin categoría';
      porCategoria[cat] = (porCategoria[cat] ?? 0) + 1;
    });
    const catData: DatoGraficoCategorias[] = Object.entries(porCategoria).map(([cat, total], i) => ({
      categoria: cat,
      total,
      color: colores[i % colores.length],
    }));
    this.renderCategoriasChart(catData);
  }

  private getUltimos7Dias(): { label: string; dateStr: string }[] {
    const labels = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push({ label: labels[d.getDay()], dateStr: d.toDateString() });
    }
    return result;
  }

  private loadGraficosConMock(): void {
    this.renderMovimientosChart(this.getMockMovimientos());
    this.renderCategoriasChart(this.getMockCategorias());
  }

  private renderMovimientosChart(datos: DatoGraficoMovimientos[]): void {
    if (!this.movimientosChartRef) return;
    this.movimientosChartInstance?.destroy();
    const ctx = this.movimientosChartRef.nativeElement.getContext('2d')!;
    this.movimientosChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: datos.map(d => d.fecha),
        datasets: [
          { label: 'Entradas', data: datos.map(d => d.entradas), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#10b981' },
          { label: 'Salidas',  data: datos.map(d => d.salidas),  borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.1)',   fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#ef4444' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { position: 'top', labels: { font: { family: 'Inter', size: 12 }, padding: 16 } },
          tooltip: { backgroundColor: '#1e293b', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
          y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Inter', size: 11 } } },
        },
      },
    });
  }

  private renderCategoriasChart(datos: DatoGraficoCategorias[]): void {
    if (!this.categoriasChartRef) return;
    this.categoriasChartInstance?.destroy();
    const ctx = this.categoriasChartRef.nativeElement.getContext('2d')!;
    this.categoriasChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: datos.map(d => d.categoria),
        datasets: [{ data: datos.map(d => d.total), backgroundColor: datos.map(d => d.color), borderWidth: 2, borderColor: '#ffffff', hoverBorderWidth: 3 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { font: { family: 'Inter', size: 11 }, padding: 12, boxWidth: 12 } },
          tooltip: { backgroundColor: '#1e293b', titleFont: { family: 'Inter' }, bodyFont: { family: 'Inter' } },
        },
        cutout: '65%',
      },
    });
  }

  private getMockResumen(): ResumenFarmacia {
    return { totalMedicamentos: 0, stockBajo: 0, proximosVencer: 0, vencidos: 0, totalMovimientosHoy: 0, entradasHoy: 0, salidasHoy: 0, valorTotalInventario: 0 };
  }

  private getMockMovimientos(): DatoGraficoMovimientos[] {
    return [
      { fecha: 'Lun', entradas: 2, salidas: 1 }, { fecha: 'Mar', entradas: 1, salidas: 2 },
      { fecha: 'Mié', entradas: 2, salidas: 1 }, { fecha: 'Jue', entradas: 1, salidas: 1 },
      { fecha: 'Vie', entradas: 1, salidas: 1 }, { fecha: 'Sáb', entradas: 0, salidas: 0 },
      { fecha: 'Dom', entradas: 2, salidas: 2 },
    ];
  }

  private getMockCategorias(): DatoGraficoCategorias[] {
    return [{ categoria: 'Sin datos', total: 1, color: '#94a3b8' }];
  }
}
