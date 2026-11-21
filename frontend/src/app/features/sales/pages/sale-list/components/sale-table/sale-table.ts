import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Pagination } from '../../../../../../shared/components/pagination/pagination';
import { SaleSummary, SalePaymentType, SaleStatus } from '../../../../models/sale.model';
import { TableSkeleton } from '../../../../../../shared/components/table-skeleton/table-skeleton';

// Dictionarios constantes fuera de la clase para evitar reasignaciones en memoria
export const PAYMENT_LABELS: Record<number, string> = {
  [SalePaymentType.Efectivo]: 'Efectivo',
  [SalePaymentType.Tarjeta]: 'Tarjeta',
  [SalePaymentType.Transferencia]: 'Transferencia',
  [SalePaymentType.Fiado]: 'Fiado',
};

export const PAYMENT_CLASSES: Record<number, string> = {
  [SalePaymentType.Efectivo]: 'bg-green-50 text-green-700',
  [SalePaymentType.Tarjeta]: 'bg-blue-50 text-blue-700',
  [SalePaymentType.Transferencia]: 'bg-purple-50 text-purple-700',
  [SalePaymentType.Fiado]: 'bg-amber-50 text-amber-700',
};

export const STATUS_LABELS: Record<number, string> = {
  [SaleStatus.Completada]: 'Completada',
  [SaleStatus.Cancelada]: 'Cancelada',
};

export const STATUS_CLASSES: Record<number, string> = {
  [SaleStatus.Completada]: 'bg-green-50 text-green-700 border-green-200/60',
  [SaleStatus.Cancelada]: 'bg-red-50 text-red-600 border-red-200/60',
};

@Component({
  selector: 'app-sale-table',
  imports: [FormsModule, DecimalPipe, DatePipe, Pagination, TableSkeleton],
  template: `
    <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
    @if (isLoading()) {
      <app-table-skeleton [rows]="5"></app-table-skeleton>
    } @else {
      <div
        class="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-medium text-slate-400 uppercase tracking-wide border-b border-slate-100"
      >
        <div class="col-span-2">Ticket</div>
        <div class="col-span-2">Fecha</div>
        <div class="col-span-3">Cliente</div>
        <div class="col-span-2">Pago</div>
        <div class="col-span-1 text-center">Total</div>
        <div class="col-span-2 text-center">Estado</div>
      </div>

      @if (sales().length === 0) {
        <div class="flex flex-col items-center justify-center py-16 text-slate-300">
          <i class="pi pi-shopping-cart text-4xl mb-3"></i>
          <p class="text-sm">No hay ventas en este período</p>
        </div>
      }

      @for (sale of sales(); track sale.id) {
        <div
          (click)="openSale.emit(sale.id)"
          class="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <!-- Ticket -->
          <div class="col-span-2">
            <span class="text-sm font-mono font-medium text-slate-700">
              {{ sale.ticketNumber }}
            </span>
          </div>

          <!-- Fecha -->
          <div class="col-span-2">
            <p class="text-sm text-slate-600">
              {{ sale.date | date: 'dd/MM/yyyy' }}
            </p>
            <p class="text-xs text-slate-400">
              {{ sale.date | date: 'HH:mm' }}
            </p>
          </div>

          <!-- Cliente -->
          <div class="col-span-3">
            @if (sale.customerName) {
              <p class="text-sm text-slate-700 truncate">
                {{ sale.customerName }}
              </p>
            } @else {
              <span class="text-sm text-slate-400">Sin cliente</span>
            }
            <p class="text-xs text-slate-400 truncate">
              {{ sale.userFullName }}
            </p>
          </div>

          <!-- Pago -->
          <div class="col-span-2">
            <span
              class="text-xs px-2 py-1 rounded-full font-medium"
              [class]="getPaymentClass(sale.paymentType)"
            >
              {{ getPaymentTypeLabel(sale.paymentType) }}
            </span>
          </div>

          <!-- Total -->
          <div class="col-span-1 text-center">
            <p class="text-sm font-semibold text-slate-700">
              S/ {{ sale.total | number: '1.2-2' }}
            </p>
          </div>

          <!-- Estado -->
          <div class="col-span-2 flex justify-center">
            <span
              class="text-xs px-2 py-1 rounded-full font-medium"
              [class]="getStatusClass(sale.status)"
            >
              {{ getStatusLabel(sale.status) }}
            </span>
          </div>
        </div>
      }
    }

    <!-- Paginación -->
    @if (!isLoading() && totalPages() > 1) {
      <app-pagination
        [currentPage]="currentPage()"
        [totalPages]="totalPages()"
        [totalCount]="totalCount()"
        [pageSize]="pageSize()"
        itemLabel="ventas"
        (pageChange)="pageChange.emit($event)"
      />
    }
  </div>`,
})
export class SaleTable {
  readonly sales = input.required<SaleSummary[]>();
  readonly isLoading = input.required<boolean>();
  readonly totalPages = input.required<number>();
  readonly totalCount = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly pageSize = input<number>(10);
  readonly pageChange = output<number>();

  readonly openSale = output<string>();

  // Transformaciones para UI usando constantes
  getPaymentTypeLabel(type: SalePaymentType): string {
    return PAYMENT_LABELS[type];
  }

  getPaymentClass(type: SalePaymentType): string {
    return PAYMENT_CLASSES[type] ?? 'bg-slate-50 text-slate-600';
  }

  getStatusClass(status: SaleStatus): string {
    return STATUS_CLASSES[status] ?? 'bg-slate-50 text-slate-600';
  }

  getStatusLabel(status: SaleStatus): string {
    return STATUS_LABELS[status];
  }
}
