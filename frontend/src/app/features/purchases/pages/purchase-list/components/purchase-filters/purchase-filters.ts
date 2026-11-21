import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PurchaseStatus } from '../../../../models/purchase.model';

import { SelectorComponent } from '../../../../../../shared/components/selector/selector';
import { Supplier } from '../../../../../suppliers/models/supplier.model';

interface StatusOption {
  id: PurchaseStatus;
  name: string;
}

@Component({
  selector: 'app-purchase-filters',
  imports: [FormsModule, SelectorComponent],
  templateUrl: './purchase-filters.html',
})
export class PurchaseFilter {
  readonly fromDate = input<string>('');
  readonly toDate = input<string>('');
  readonly selectedStatus = input<PurchaseStatus | undefined>(undefined);
  readonly suppliers = input<Supplier[]>([]);
  readonly selectedSupplier = input<string | undefined>(undefined); // Recibe el ID string

  readonly fromDateChange = output<string>();
  readonly toDateChange = output<string>();
  readonly statusChange = output<PurchaseStatus | undefined>();
  readonly supplierChange = output<string | undefined>();


  protected readonly statusOptions: StatusOption[] = [
    { id: PurchaseStatus.Pendiente, name: 'Pendiente' },
    { id: PurchaseStatus.RecibidaConforme, name: 'Recibida Conforme' },
    { id: PurchaseStatus.RecibidaConDiferencia, name: 'Recibida con Diferencia' },
    { id: PurchaseStatus.Cancelada, name: 'Cancelada' },
  ];

  protected readonly currentStatusObject = computed<StatusOption | null>(() => {
    const status = this.selectedStatus();
    if (status === undefined) return null;
    return this.statusOptions.find((opt) => opt.id === status) ?? null;
  });

  protected readonly currentSupplierObject = computed<Supplier | null>(() => {
    const id = this.selectedSupplier();
    return id ? (this.suppliers().find((s) => s.id === id) ?? null) : null;
  });

  // 4. Cuando el buscador genérico emite un objeto seleccionado (o null al limpiar)
  protected onStatusChange(option: StatusOption | null): void {
    this.statusChange.emit(option ? option.id : undefined);
  }

  protected onSupplierChange(option: Supplier | null): void {
    // Emitimos el ID string hacia el componente padre
    this.supplierChange.emit(option ? option.id : undefined);
  }
}
