import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';

import { MedicamentoService } from '../../services/medicamento.service';
import { Movimiento, TipoMovimiento } from '../../models/farmacia.models';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, Button, Tag, Select,
  ],
  templateUrl: './movimientos.component.html',
})
export class MovimientosComponent implements OnInit {
  private readonly medicamentoService = inject(MedicamentoService);

  movimientos  = signal<Movimiento[]>([]);
  totalRecords = signal(0);
  isLoading    = signal(true);

  rows  = 20;
  first = 0;

  filtroTipo: TipoMovimiento | null = null;

  opcionesTipo = [
    { label: 'Todos',       value: null },
    { label: 'Entrada',     value: 'ENTRADA' },
    { label: 'Salida',      value: 'SALIDA' },
    { label: 'Ajuste',      value: 'AJUSTE' },
    { label: 'Devolución',  value: 'DEVOLUCION' },
    { label: 'Traslado',    value: 'TRASLADO' },
  ];

  readonly tipoMeta: Record<TipoMovimiento, { label: string; icon: string; severity: 'success' | 'danger' | 'info' | 'warn' }> = {
    ENTRADA:    { label: 'Entrada',     icon: 'pi pi-arrow-down-circle', severity: 'success' },
    SALIDA:     { label: 'Salida',      icon: 'pi pi-arrow-up-circle',   severity: 'danger'  },
    AJUSTE:     { label: 'Ajuste',      icon: 'pi pi-cog',               severity: 'info'    },
    DEVOLUCION: { label: 'Devolución',  icon: 'pi pi-undo',              severity: 'warn'    },
    TRASLADO:   { label: 'Traslado',    icon: 'pi pi-arrows-h',          severity: 'info'    },
  };

  ngOnInit(): void { this.loadPage(0); }

  loadPage(page: number): void {
    this.isLoading.set(true);
    this.medicamentoService
      .getMovimientos(this.filtroTipo ?? undefined, page, this.rows)
      .subscribe({
        next: (res) => {
          this.movimientos.set(res.content);
          this.totalRecords.set(res.totalElements);
          this.isLoading.set(false);
        },
        error: () => {
          this.movimientos.set(this.getMock());
          this.totalRecords.set(2);
          this.isLoading.set(false);
        },
      });
  }

  onPageChange(event: { first: number; rows: number }): void {
    this.first = event.first;
    this.rows  = event.rows;
    this.loadPage(event.first / event.rows);
  }

  onFilterChange(): void { this.loadPage(0); }

  totalCantidad(mov: Movimiento): number {
    return (mov.detalles ?? []).reduce((sum, d) => sum + d.cantidad, 0);
  }

  getSeverity(tipo: TipoMovimiento): 'success' | 'danger' | 'info' | 'warn' {
    return this.tipoMeta[tipo]?.severity ?? 'info';
  }

  getIcon(tipo: TipoMovimiento): string {
    return this.tipoMeta[tipo]?.icon ?? 'pi pi-circle';
  }

  private getMock(): Movimiento[] {
    return [
      {
        id: 1,
        tipoMovimiento: 'ENTRADA',
        fecha: new Date().toISOString(),
        usuarioId: 'admin',
        numeroDocumento: 'OC-001',
        observacion: 'Compra a proveedor',
        detalles: [
          { id: 1, productoId: 1, nombreProducto: 'Paracetamol 500mg', loteId: 1, numeroLote: 'L-001', cantidad: 200, precioUnitario: 0.15 },
        ],
      },
      {
        id: 2,
        tipoMovimiento: 'SALIDA',
        fecha: new Date().toISOString(),
        usuarioId: 'admin',
        observacion: 'Dispensación paciente',
        detalles: [
          { id: 2, productoId: 2, nombreProducto: 'Amoxicilina 500mg', loteId: 2, numeroLote: 'L-002', cantidad: 30, precioUnitario: 0.80 },
        ],
      },
    ];
  }
}
