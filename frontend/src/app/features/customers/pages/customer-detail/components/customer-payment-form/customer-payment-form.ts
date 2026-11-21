import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CreateCreditPaymentRequest } from '../../../../../credit-payment/models/credit-payment';
import { SalePaymentType } from '../../../../../sales/models/sale.model';
import { PaymentOption } from '../../../../../sales/pages/sale-form/components/sale-payment-summary/sale-payment-summary';
import { SelectorComponent } from '../../../../../../shared/components/selector/selector';

@Component({
  selector: 'app-customer-payment-form',
  imports: [FormsModule, DecimalPipe, SelectorComponent],
  templateUrl: './customer-payment-form.html',
})
export class CustomerPaymentForm {
  readonly currentDebt = input.required<number>();
  readonly customerId = input.required<string>();
  readonly isSaving = input<boolean>(false);
  readonly paymentSuccess = input<string | null>(null);
  readonly paymentError = input<string | null>(null);

  readonly submitPayment = output<CreateCreditPaymentRequest>();

  paymentAmount = signal<number | null>(null);
  paymentType = signal<SalePaymentType>(SalePaymentType.Efectivo);
  paymentNotes = signal<string>('');

  readonly paymentOptions: PaymentOption[] = [
    { value: SalePaymentType.Efectivo, label: 'Efectivo' },
    { value: SalePaymentType.Tarjeta, label: 'Tarjeta' },
    { value: SalePaymentType.Transferencia, label: 'Transferencia' }
  ];

  isPaymentFormValid = computed(() => {
    const amount = Number(this.paymentAmount() ?? 0);
    const debt = this.currentDebt();
    return amount > 0 && amount <= debt;
  });

  onSubmit(): void {
    if (!this.isPaymentFormValid()) return;

    const customerId = this.customerId();
    const amount = Number(this.paymentAmount());
    const notes = this.paymentNotes().trim() || undefined;
    const paymentType = this.paymentType();

    this.submitPayment.emit({ customerId, amount, paymentType, notes });
  }

  resetForm(): void {
    this.paymentAmount.set(null);
    this.paymentNotes.set('');
  }
}
