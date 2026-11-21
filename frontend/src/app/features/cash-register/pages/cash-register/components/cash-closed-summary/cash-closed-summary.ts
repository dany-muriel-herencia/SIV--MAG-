import { Component, input, output } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CashRegisterResponse } from '../../../../models/cash-register.model';

@Component({
  selector: 'app-cash-closed-summary',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './cash-closed-summary.html',
})
export class CashClosedSummary {
  readonly session = input<CashRegisterResponse | null>(null);

  readonly onNewShift = output<void>();
  readonly onViewHistory = output<void>();
}