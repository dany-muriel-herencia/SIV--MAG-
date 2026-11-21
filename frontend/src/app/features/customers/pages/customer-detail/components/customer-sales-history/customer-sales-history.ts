import { Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Pagination } from '../../../../../../shared/components/pagination/pagination';
import { TableSkeleton } from "../../../../../../shared/components/table-skeleton/table-skeleton";
import { SalePaymentType, SaleStatus, SaleSummary } from '../../../../../sales/models/sale.model';

const PAYMENT_LABELS: Record<string | number, string> = {
  [SalePaymentType.Efectivo]: '💵 Efectivo',
  [SalePaymentType.Tarjeta]: '💳 Tarjeta',
  [SalePaymentType.Transferencia]: '🏦 Transferencia',
  [SalePaymentType.Fiado]: '📋 Fiado',
  Efectivo: '💵 Efectivo',
  Tarjeta: '💳 Tarjeta',
  Transferencia: '🏦 Transferencia',
  Fiado: '📋 Fiado',
};

const PAYMENT_CLASSES: Record<string | number, string> = {
  [SalePaymentType.Efectivo]: 'bg-green-50 text-green-700',
  [SalePaymentType.Tarjeta]: 'bg-blue-50 text-blue-700',
  [SalePaymentType.Transferencia]: 'bg-purple-50 text-purple-700',
  [SalePaymentType.Fiado]: 'bg-amber-50 text-amber-700',
  Efectivo: 'bg-green-50 text-green-700',
  Tarjeta: 'bg-blue-50 text-blue-700',
  Transferencia: 'bg-purple-50 text-purple-700',
  Fiado: 'bg-amber-50 text-amber-700',
};

@Component({
  selector: 'app-customer-sales-history',
  imports: [DatePipe, DecimalPipe, Pagination, TableSkeleton],
  templateUrl: './customer-sales-history.html',
})
export class CustomerSalesHistory {
  readonly sales = input.required<SaleSummary[]>();
  readonly totalCount = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly isLoading = input<boolean>(false);
  readonly pageSize = input<number>(5);

  readonly pageChange = output<number>();
  readonly openSale = output<string>();

  protected readonly SaleStatus = SaleStatus;

  getPaymentTypeLabel(type: SalePaymentType | string): string {
    return PAYMENT_LABELS[type] ?? String(type);
  }

  getPaymentClass(type: SalePaymentType | string): string {
    return PAYMENT_CLASSES[type] ?? 'bg-slate-50 text-slate-600';
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onOpenSale(saleId: string): void {
    this.openSale.emit(saleId);
  }
}
