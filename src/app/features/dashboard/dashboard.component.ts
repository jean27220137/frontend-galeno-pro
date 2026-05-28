import {
  Component, OnInit, inject, signal,
  AfterViewInit, OnDestroy, ElementRef, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Tag } from 'primeng/tag';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Tag],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly authService = inject(AuthService);

  @ViewChild('activityChart', { static: false }) chartRef!: ElementRef<HTMLCanvasElement>;
  private chartInstance?: Chart;

  readonly today = new Date();

  stats = signal([
    { label: 'Pacientes Hoy',     value: 142, icon: 'pi pi-users',        color: '#2378f0', bg: '#e8f0fe', routerLink: '/consulta-externa/paciente' },
    { label: 'Citas Programadas', value: 87,  icon: 'pi pi-calendar',     color: '#00bcd4', bg: '#e0f7fa', routerLink: '/consulta-externa/citas'    },
    { label: 'En Emergencia',     value: 23,  icon: 'pi pi-bolt',         color: '#ef4444', bg: '#fee2e2', routerLink: '/emergencia/admision'        },
    { label: 'Camas Ocupadas',    value: 156, icon: 'pi pi-building',     color: '#f59e0b', bg: '#fef9c3', routerLink: '/hospitalizacion/mapa-camas' },
    { label: 'Recaudación Hoy',   value: 18450, icon: 'pi pi-dollar',     color: '#10b981', bg: '#dcfce7', routerLink: '/caja/cobros', isMoneda: true },
    { label: 'Med. Stock Bajo',   value: 23,  icon: 'pi pi-exclamation-triangle', color: '#f97316', bg: '#fff7ed', routerLink: '/farmacia/alertas' },
  ]);

  accesosRapidos = [
    { label: 'Nueva Cita',         icon: 'pi pi-calendar-plus',   link: '/consulta-externa/citas/nueva',      color: '#2378f0' },
    { label: 'Admisión Emergencia',icon: 'pi pi-bolt',             link: '/emergencia/admision',               color: '#ef4444' },
    { label: 'Inventario Farmacia',icon: 'pi pi-box',              link: '/farmacia/inventario',               color: '#00bcd4' },
    { label: 'Gestor de Colas',    icon: 'pi pi-list',             link: '/consulta-externa/gestor-colas',     color: '#10b981' },
    { label: 'Caja',               icon: 'pi pi-dollar',           link: '/caja/cobros',                       color: '#f59e0b' },
    { label: 'Asignar Médico',     icon: 'pi pi-user-edit',        link: '/programacion/asignacion',           color: '#8b5cf6' },
  ];

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    setTimeout(() => this.renderChart(), 100);
  }

  ngOnDestroy(): void {
    this.chartInstance?.destroy();
  }

  private renderChart(): void {
    if (!this.chartRef) return;
    const ctx = this.chartRef.nativeElement.getContext('2d')!;
    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [
          {
            label: 'Consultas', data: [45, 68, 55, 72, 60, 30, 12],
            backgroundColor: 'rgba(35,120,240,.7)', borderRadius: 6, borderSkipped: false,
          },
          {
            label: 'Emergencias', data: [18, 22, 15, 28, 20, 8, 5],
            backgroundColor: 'rgba(239,68,68,.7)', borderRadius: 6, borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
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
}
