import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BadgeComponent } from '../../../../../../shared/components/badge/badge';
import { Alert, AlertType } from '../../../../models/alert.model';

const ALERT_TYPE_BADGE = {
  [AlertType.StockMinimo]: {
    label: 'Stock Mínimo',
    class: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  [AlertType.StockAgotado]: {
    label: 'Stock Agotado',
    class: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  [AlertType.DeudaLimiteCliente]: {
    label: 'Deuda Límite Cliente',
    class: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  [AlertType.CompraPendiente]: {
    label: 'Compra Pendiente',
    class: 'bg-sky-100 text-sky-800 border-sky-200',
  },
};

@Component({
  selector: 'app-alert-table',
  imports: [BadgeComponent, DatePipe],
  templateUrl: './alert-table.html',
})
export class AlertTable {
  readonly alerts = input.required<Alert[]>();
  readonly isPending = input<boolean>();
  readonly markAsRead = output<string>();
  readonly markAsUnread = output<string>();

  protected readonly AlertType = AlertType;

  getAlertTypeText(type: AlertType) {
    return (
      ALERT_TYPE_BADGE[type] ?? {
        label: 'Desconocido',
        class: 'bg-slate-100 text-slate-600 border-slate-200',
      }
    );
  }

  getReadText(isRead: boolean) {
    return isRead
      ? { label: 'Leída', class: 'bg-slate-100 text-slate-500 border-slate-200/60' }
      : { label: 'Nueva', class: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 font-semibold' };
  }

  toggleReadStatus(alert: Alert): void {
    if (alert.isRead) {
      this.markAsUnread.emit(alert.id);
    } else {
      this.markAsRead.emit(alert.id);
    }
  }
}