import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectorComponent } from '../../../../../../shared/components/selector/selector';
import { SegmentedControlComponent } from '../../../../../../shared/components/segmented-control/segmented-control';
import { AlertType } from '../../../../models/alert.model';
import { SegmentedOption } from '../../../../../../shared/models/segmented-control.model';

@Component({
  selector: 'app-alert-filters',
  imports: [SelectorComponent, FormsModule, SegmentedControlComponent],
  templateUrl: './alert-filters.html',
})
export class AlertFilters {
  readonly currentType = input<AlertType | undefined>(undefined);
  readonly currentIsRead = input<boolean | undefined>(undefined);

  readonly filterType = output<AlertType | undefined>();
  readonly filterIsRead = output<boolean | undefined>();

  readonly types = [
    { label: 'Todos los tipos', value: undefined },
    { label: 'Stock Mínimo', value: AlertType.StockMinimo },
    { label: 'Stock Agotado', value: AlertType.StockAgotado },
    { label: 'Deuda Límite Cliente', value: AlertType.DeudaLimiteCliente },
    { label: 'Compra Pendiente', value: AlertType.CompraPendiente },
  ];

  readonly isReadOptions: SegmentedOption<boolean | undefined>[] = [
    { label: 'Todos', value: undefined },
    {
      label: 'Leídos',
      value: true,
      icon: 'pi pi-check-circle text-emerald-500',
      activeClass: 'text-emerald-700 border-emerald-200',
    },
    {
      label: 'No leídos',
      value: false,
      icon: 'pi pi-bell text-amber-500',
      activeClass: 'text-amber-700 border-amber-200',
    },
  ];

  protected readonly currentTypeObject = computed(() => {
    const type = this.currentType();
    return type ? (this.types.find((opt) => opt.value === type) ?? null) : null;
  });

  protected onFilterTypeChange(option: { label: string; value: AlertType } | null): void {
    this.filterType.emit(option?.value);
  }

  protected onFilterIsReadChange(value: boolean | undefined): void {
    this.filterIsRead.emit(value);
  }
}
