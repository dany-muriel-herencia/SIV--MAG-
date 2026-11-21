import { Component, computed, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CashRegisterResponse, CloseCashRegisterRequest } from '../../../../../../models/cash-register.model';


@Component({
  selector: 'app-shift-arqueo-panel',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './shift-arqueo-panel.html',
})
export class ShiftArqueoPanel {
  readonly session = input<CashRegisterResponse | null>(null);
  readonly expectedBalance = input<number>(0);
  readonly isClosing = input<boolean>(false);

  readonly onClose = output<CloseCashRegisterRequest>();

  protected closingBalance = signal<number | null>(null);
  protected closingNotes = signal<string>('');
  protected showModal = signal<boolean>(false);

  protected countedAmount = computed(() => {
    const val = this.closingBalance();
    if (val === null) return null;
    const num = Number(val);
    return isNaN(num) ? null : Math.round(num * 100) / 100;
  });

  protected difference = computed(() => {
    const counted = this.countedAmount();
    if (counted === null) return 0;
    return Math.round((counted - this.expectedBalance()) * 100) / 100;
  });

  protected diffStatus = computed<'none' | 'exact' | 'surplus' | 'shortage'>(() => {
    if (this.closingBalance() === null) return 'none';
    const diff = Math.round(this.difference() * 100) / 100;
    if (diff === 0) return 'exact';
    return diff > 0 ? 'surplus' : 'shortage';
  });

  protected setExactAmount(): void {
    this.closingBalance.set(this.expectedBalance());
  }

  protected openConfirmModal(): void {
    if (this.closingBalance() === null) {
      this.closingBalance.set(0);
    }
    this.showModal.set(true);
  }

  protected confirmClose(): void {
    this.showModal.set(false);
    const balance = Number(this.closingBalance()) || 0;
    this.onClose.emit({
      closingBalance: balance,
      closingNotes: this.closingNotes().trim() || undefined,
    });
    this.closingBalance.set(null);
    this.closingNotes.set('');
  }
}