// ══════════════════════════════════════════════════════════════
//  Modelos del Módulo Farmacia — alineados con farmacia-service
// ══════════════════════════════════════════════════════════════

// ── Categoría ───────────────────────────────────────────────────
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

// Extiende con campos opcionales de UI (backend los ignora al recibirlos)
export interface CategoriaMedicamento extends Categoria {
  color?: string;
  icono?: string;
  totalMedicamentos?: number;
}

// ── Producto / Medicamento ──────────────────────────────────────
export type FormaFarmaceutica =
  | 'TABLETA' | 'CAPSULA' | 'JARABE' | 'INYECTABLE'
  | 'CREMA' | 'SUPOSITORIO' | 'GOTAS' | 'INHALADOR' | 'PARCHE' | 'OTRO';

export type FormaMedicamento = FormaFarmaceutica;

export type EstadoProducto = 'ACTIVO' | 'INACTIVO' | 'AGOTADO';
export type EstadoMedicamento = EstadoProducto | 'VENCIDO';
export type AlertaVencimiento = 'OK' | 'PROXIMO' | 'CRITICO' | 'VENCIDO';

// Shape exacto del ProductoResponse del backend
export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  principioActivo?: string;
  laboratorio?: string;
  concentracion?: string;
  formaFarmaceutica?: FormaFarmaceutica;
  unidadMedida?: string;
  precioUnitario?: number;
  stockActual: number;
  stockMinimo: number;
  estado: EstadoProducto;
  categoria?: CategoriaMedicamento;
}

// Extiende Producto con campos legacy usados en componentes y templates existentes
export interface Medicamento extends Producto {
  nombreGenerico?: string;        // alias de principioActivo
  forma?: FormaFarmaceutica;      // alias de formaFarmaceutica
  stockMaximo?: number;
  precioCompra?: number;
  precioVenta?: number;
  fechaVencimiento?: string;
  lote?: string;
  alertaVencimiento?: AlertaVencimiento;
  farmacia?: { id: number; nombre: string; codigo?: string };
  createdAt?: string;
  updatedAt?: string;
}

// ── Lote ────────────────────────────────────────────────────────
export type EstadoLote = 'ACTIVO' | 'AGOTADO' | 'VENCIDO';

export interface Lote {
  id: number;
  productoId: number;
  nombreProducto: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidadInicial: number;
  cantidadDisponible: number;
  estado: EstadoLote;
}

// ── Movimientos ─────────────────────────────────────────────────
export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'DEVOLUCION' | 'TRASLADO';

export interface MovimientoDetalle {
  id: number;
  productoId: number;
  nombreProducto: string;
  loteId: number;
  numeroLote: string;
  cantidad: number;
  precioUnitario: number;
}

// Shape exacto del MovimientoResponse del backend
export interface Movimiento {
  id: number;
  tipoMovimiento: TipoMovimiento;
  fecha: string;
  numeroDocumento?: string;
  observacion?: string;
  usuarioId: string;
  detalles: MovimientoDetalle[];
}

// Extiende Movimiento con campos legacy para componentes existentes
export interface MovimientoInventario extends Movimiento {
  tipo?: TipoMovimiento;
  cantidad?: number;
  cantidadAnterior?: number;
  cantidadResultante?: number;
  unidadMedida?: string;
  motivoMovimiento?: string;
  observaciones?: string;
  medicamento?: { id: number; codigo: string; nombre: string; forma?: string; concentracion?: string };
  farmacia?: { id: number; nombre: string };
  usuario?: string;
  fechaMovimiento?: string;
}

// ── Alertas ─────────────────────────────────────────────────────
export interface AlertaStock {
  productoId: number;
  codigo: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  deficit: number;
}

export interface AlertaLote {
  loteId: number;
  productoId: number;
  nombreProducto: string;
  numeroLote: string;
  fechaVencimiento: string;
  cantidadDisponible: number;
  estado: EstadoLote;
  diasParaVencer: number;
}

// ── Farmacia (sin endpoint en backend aún, mantenida para UI) ───
export type EstadoFarmacia = 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO';

export interface Farmacia {
  id: number;
  nombre: string;
  codigo: string;
  direccion: string;
  responsable: string;
  telefono: string;
  estado: EstadoFarmacia;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFarmaciaDto {
  nombre: string;
  codigo: string;
  direccion: string;
  responsable: string;
  telefono: string;
}

// ── DTOs de request ─────────────────────────────────────────────
export interface ProductoRequest {
  codigo: string;
  nombre: string;
  principioActivo: string;
  laboratorio?: string;
  concentracion?: string;
  formaFarmaceutica?: FormaFarmaceutica;
  unidadMedida: string;
  precioUnitario: number;
  stockMinimo?: number;
  categoriaId: number;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion?: string;
}

export interface EntradaDetalleRequest {
  productoId: number;
  numeroLote: string;
  fechaVencimiento: string;
  cantidad: number;
  precioUnitario: number;
}

export interface EntradaRequest {
  numeroDocumento?: string;
  observacion?: string;
  detalles: EntradaDetalleRequest[];
}

export interface SalidaDetalleRequest {
  productoId: number;
  loteId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface SalidaRequest {
  numeroDocumento?: string;
  observacion?: string;
  detalles: SalidaDetalleRequest[];
}

// Legacy — referenciado en movimientos.component.ts
export interface CreateMovimientoDto {
  medicamentoId?: number;
  farmaciaId?: number;
  tipo?: TipoMovimiento;
  cantidad?: number;
  motivoMovimiento?: string;
  observaciones?: string;
  numeroDocumento?: string;
  proveedor?: string;
}

export interface FiltroInventario {
  search?: string;
  categoriaId?: number;
  farmaciaId?: number;
  alertaVencimiento?: AlertaVencimiento;
  estado?: EstadoMedicamento;
  stockBajo?: boolean;
}

// ── Dashboard ────────────────────────────────────────────────────
export interface ResumenFarmacia {
  totalMedicamentos: number;
  stockBajo: number;
  proximosVencer: number;
  vencidos: number;
  totalMovimientosHoy: number;
  entradasHoy: number;
  salidasHoy: number;
  valorTotalInventario: number;
}

export interface DatoGraficoMovimientos {
  fecha: string;
  entradas: number;
  salidas: number;
}

export interface DatoGraficoCategorias {
  categoria: string;
  total: number;
  color: string;
}
