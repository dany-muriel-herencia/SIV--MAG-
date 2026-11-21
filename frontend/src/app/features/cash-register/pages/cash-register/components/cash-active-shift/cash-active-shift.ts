import { Component, computed, input, output } from '@angular/core';
import { CashRegisterResponse, CloseCashRegisterRequest } from '../../../../models/cash-register.model';
import { ShiftHeader } from './components/shift-header/shift-header';
import { ShiftMetricsGrid } from './components/shift-metrics-grid/shift-metrics-grid';
import { ShiftArqueoPanel } from './components/shift-arqueo-panel/shift-arqueo-panel';

@Component({
  selector: 'app-cash-active-shift',
  imports: [ShiftHeader, ShiftMetricsGrid, ShiftArqueoPanel],
  templateUrl: './cash-active-shift.html',
})
export class CashActiveShift {
  readonly session = input<CashRegisterResponse | null>(null);
  readonly elapsedTime = input<string>('00h 00m');
  readonly isClosing = input<boolean>(false);
  readonly errorMessage = input<string | null>(null);

  readonly onGoToSales = output<void>();
  readonly onClose = output<CloseCashRegisterRequest>();

  // Cálculo del efectivo total esperado
  protected readonly expectedBalance = computed(() => {
    const s = this.session();
    const base = Number(s?.openingBalance) || 0;
    const cashSales = Number(s?.summary?.totalCash) || 0;
    return Math.round((base + cashSales) * 100) / 100;
  });
}