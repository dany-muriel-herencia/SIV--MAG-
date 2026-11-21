import { Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pagination } from '../../../../../../shared/components/pagination/pagination';
import { TableSkeleton } from '../../../../../../shared/components/table-skeleton/table-skeleton';
import { CreditPaymentResponse } from '../../../../../credit-payment/models/credit-payment';
import { SalePaymentType } from '../../../../../sales/models/sale.model';
import {
  PAYMENT_CLASSES,
  PAYMENT_LABELS,
} from '../../../../../sales/pages/sale-list/components/sale-table/sale-table';

@Component({
  selector: 'app-customer-payments-history',
  imports: [DatePipe, DecimalPipe, FormsModule, Pagination, TableSkeleton],
  templateUrl: './customer-payments-history.html',
})
export class CustomerPaymentsHistory {
  readonly payments = input.required<CreditPaymentResponse[]>();
  readonly totalCount = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly isLoading = input<boolean>(false);
  readonly pageSize = input<number>(5);
  readonly dateFrom = input<string | undefined>(undefined);
  readonly dateTo = input<string | undefined>(undefined);

  readonly pageChange = output<number>();
  readonly dateFilterChange = output<{ from?: string; to?: string }>();
  readonly clearFilters = output<void>();

  onFromChange(value: string): void {
    this.dateFilterChange.emit({
      from: value || undefined,
      to: this.dateTo(),
    });
  }

  onToChange(value: string): void {
    this.dateFilterChange.emit({
      from: this.dateFrom(),
      to: value || undefined,
    });
  }

  onClear(): void {
    this.clearFilters.emit();
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  getPaymentTypeLabel(type: SalePaymentType): string {
    return PAYMENT_LABELS[type];
  }

  getPaymentClass(type: SalePaymentType): string {
    return PAYMENT_CLASSES[type] ?? 'bg-slate-50 text-slate-600';
  }
}
