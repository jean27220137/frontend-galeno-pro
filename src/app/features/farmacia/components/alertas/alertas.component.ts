import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { forkJoin } from 'rxjs';
import { MedicamentoService } from '../../services/medicamento.service';
import { AlertaLote, EstadoLote } from '../../models/farmacia.models';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, NgTemplateOutlet, Tag, Skeleton],
  templateUrl: './alertas.component.html',
})
export class AlertasComponent implements OnInit {
  private readonly medicamentoService = inject(MedicamentoService);

  allLotes   = signal<AlertaLote[]>([]);
  isLoading  = signal(true);

  vencidos = computed(() => this.allLotes().filter(l => l.estado === 'VENCIDO'));
  criticos = computed(() => this.allLotes().filter(l => l.estado !== 'VENCIDO' && l.diasParaVencer <= 30));
  proximos = computed(() => this.allLotes().filter(l => l.estado !== 'VENCIDO' && l.diasParaVencer > 30));

  ngOnInit(): void {
    forkJoin({
      porVencer: this.medicamentoService.getAlertasPorVencer(),
      vencidos:  this.medicamentoService.getAlertasVencidos(),
    }).subscribe({
      next: ({ porVencer, vencidos }) => {
        this.allLotes.set([...porVencer, ...vencidos]);
        this.isLoading.set(false);
      },
      error: () => {
        this.allLotes.set(this.getMockAlertas());
        this.isLoading.set(false);
      },
    });
  }

  getDiasRestantes(fechaVencimiento: string): number {
    const hoy  = new Date();
    const venc = new Date(fechaVencimiento);
    return Math.ceil((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  getSeverityEstado(estado: EstadoLote): 'danger' | 'warn' | 'success' {
    if (estado === 'VENCIDO') return 'danger';
    if (estado === 'AGOTADO') return 'warn';
    return 'success';
  }

  private getMockAlertas(): AlertaLote[] {
    return [
      {
        loteId: 1, productoId: 1, nombreProducto: 'Metronidazol 250mg',
        numeroLote: 'L-001', fechaVencimiento: '2025-02-01',
        cantidadDisponible: 80, estado: 'VENCIDO', diasParaVencer: -112,
      },
      {
        loteId: 2, productoId: 2, nombreProducto: 'Ciprofloxacino 500mg',
        numeroLote: 'L-002', fechaVencimiento: '2026-06-15',
        cantidadDisponible: 150, estado: 'ACTIVO', diasParaVencer: 23,
      },
      {
        loteId: 3, productoId: 3, nombreProducto: 'Omeprazol 20mg',
        numeroLote: 'L-003', fechaVencimiento: '2026-08-20',
        cantidadDisponible: 200, estado: 'ACTIVO', diasParaVencer: 89,
      },
    ];
  }
}
