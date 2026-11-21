import { Component, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OpenCashRegisterRequest } from '../../../../models/cash-register.model';

@Component({
  selector: 'app-cash-open-card',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './cash-open-card.html',
})
export class CashOpenCard {
  readonly isLoading = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);
  
  readonly onOpen = output<OpenCashRegisterRequest>();

  protected readonly openingBalance = signal<number>(0);
  protected readonly notes = signal<string>('');

  protected readonly presets = [20, 50, 100, 200, 500];

  protected addPreset(amount: number): void {
    const current = Number(this.openingBalance()) || 0;
    this.openingBalance.set(current + amount);
  }

  protected clearBalance(): void {
    this.openingBalance.set(0);
  }

  protected submit(): void {
    const balance = Number(this.openingBalance());
    if (isNaN(balance) || balance < 0) return;

    this.onOpen.emit({
      openingBalance: balance,
      openingNotes: this.notes().trim() || undefined,
    });
  }
}