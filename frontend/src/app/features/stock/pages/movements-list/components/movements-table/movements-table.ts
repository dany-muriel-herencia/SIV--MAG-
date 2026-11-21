import { Component, input, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MovementType, StockMovement } from '../../../../models/stock.model';
import { TableSkeleton } from '../../../../../../shared/components/table-skeleton/table-skeleton';
import { Pagination } from '../../../../../../shared/components/pagination/pagination';

interface TypeConfig {
  label: string;
  icon: string;
  class: string;
}

// Mapa estático fuera del componente: se evalúa 1 sola vez en memoria
const MOVEMENT_TYPE_CONFIG: Record<number, TypeConfig> = {
  [MovementType.CompraProveedor]: {
    label: 'Compra Proveedor',
    icon: 'pi-shopping-cart',
    class: 'bg-blue-50 text-blue-700 border border-blue-200/80',
  },
  [MovementType.AjustePositivo]: {
    label: 'Ajuste (+)',
    icon: 'pi-plus-circle',
    class: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  },
  [MovementType.Venta]: {
    label: 'Venta',
    icon: 'pi-tag',
    class: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
  },
  [MovementType.AjusteNegativo]: {
    label: 'Ajuste (−)',
    icon: 'pi-minus-circle',
    class: 'bg-rose-50 text-rose-700 border border-rose-200/80',
  },
  [MovementType.DevolucionVenta]: {
    label: 'Devolución Venta',
    icon: 'pi-refresh',
    class: 'bg-amber-50 text-amber-700 border border-amber-200/80',
  },
  [MovementType.DevolucionCompra]: {
    label: 'Devolución Compra',
    icon: 'pi-undo',
    class: 'bg-cyan-50 text-cyan-700 border border-cyan-200/80',
  },
};

const DEFAULT_CONFIG: TypeConfig = {
  label: 'Desconocido',
  icon: 'pi-question-circle',
  class: 'bg-slate-50 text-slate-600 border border-slate-200/80',
};

const ENTRY_TYPES = new Set([
  MovementType.CompraProveedor,
  MovementType.AjustePositivo,
  MovementType.DevolucionVenta,
]);

@Component({
  selector: 'app-movements-table',
  standalone: true,
  imports: [CommonModule, DatePipe, TableSkeleton, Pagination],
  templateUrl: './movements-table.html',
})
export class MovementsTable {
  readonly isLoading = input<boolean>(false);
  readonly movements = input<StockMovement[]>([]);
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);
  readonly totalCount = input<number>(0);
  readonly pageSize = input<number>(15);

  readonly onPageChange = output<number>();

  protected getTypeConfig(type: MovementType | number): TypeConfig {
  // Number(type) asegura que "1" o 1 se conviertan al entero correcto del Enum
  const numericType = Number(type);
  return MOVEMENT_TYPE_CONFIG[numericType] ?? DEFAULT_CONFIG;
}

protected isEntry(type: MovementType | number): boolean {
  // Convertimos a número antes de verificar en el Set
  return ENTRY_TYPES.has(Number(type));
}
}