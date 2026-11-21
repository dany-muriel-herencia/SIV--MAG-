import { Component, inject, input, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SalePaymentType, SaleStatus } from '../../models/sale.model';
import { DecimalPipe, DatePipe } from '@angular/common';
import { useSaleDetailQuery, useCancelSaleMutation } from '../../queries/sales.queries';
import { SaleCancelModal } from './components/sale-cancel-modal/sale-cancel-modal';
import { extractErrorMessage } from '../../../../shared/utils/error';

const PAYMENT_CLASSES: Record<SalePaymentType, string> = {
  [SalePaymentType.Efectivo]: 'bg-green-50 text-green-700',
  [SalePaymentType.Tarjeta]: 'bg-blue-50 text-blue-700',
  [SalePaymentType.Transferencia]: 'bg-purple-50 text-purple-700',
  [SalePaymentType.Fiado]: 'bg-amber-50 text-amber-700',
};

const PAYMENT_LABELS: Record<SalePaymentType, string> = {
  [SalePaymentType.Efectivo]: 'Efectivo',
  [SalePaymentType.Tarjeta]: 'Tarjeta',
  [SalePaymentType.Transferencia]: 'Transferencia',
  [SalePaymentType.Fiado]: 'Fiado',
};

@Component({
  selector: 'app-sale-detail',
  imports: [DecimalPipe, DatePipe, SaleCancelModal],
  templateUrl: './sale-detail.html',
})
export class SaleDetail {
  private readonly router = inject(Router);

  protected readonly SaleStatus = SaleStatus;

  readonly id = input.required<string>();

  private readonly saleDetailQuery = useSaleDetailQuery(this.id);
  private readonly cancelSaleMutation = useCancelSaleMutation();

  readonly sale = computed(() => this.saleDetailQuery.data() ?? null);
  readonly isLoading = computed(() => this.saleDetailQuery.isLoading());
  readonly isCancelling = computed(() => this.cancelSaleMutation.isPending());

  readonly error = computed(() => {
    const queryErr = this.saleDetailQuery.error();
    const mutErr = this.cancelSaleMutation.error();
    const err = mutErr || queryErr;
    if (!err) return null;
    return extractErrorMessage(err, 'No se pudo procesar la solicitud.');
  });

  showConfirmCancel = signal<boolean>(false);

  onCancel(): void {
    this.showConfirmCancel.set(true);
  }

  confirmCancel(): void {
    this.cancelSaleMutation.mutate(this.id(), {
      onSuccess: () => {
        this.showConfirmCancel.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/sales']);
  }

  getPaymentClass(type: SalePaymentType): string {
    return PAYMENT_CLASSES[type] ?? 'bg-slate-50 text-slate-600';
  }

  getPaymentLabel(type: SalePaymentType): string {
    return PAYMENT_LABELS[type] ?? String(type);
  }
}
