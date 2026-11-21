import { Component, input, output } from '@angular/core';
import { Supplier } from '../../../../models/supplier.model';

@Component({
  selector: 'app-supplier-table',
  imports: [],
  templateUrl: './supplier-table.html',
})
export class SupplierTable {
  readonly suppliers = input.required<Supplier[]>();
  readonly isRefetching = input<boolean>();
  readonly isAdmin = input<boolean>(false);

  readonly openSupplier = output<string>();
  readonly editSupplier = output<string>();
  readonly toggleActive = output<string>();

  onToggleActive(id: string, event: Event): void {
    event.stopPropagation();
    this.toggleActive.emit(id);
  }

  openSupplierDetail(id: string) {
    this.openSupplier.emit(id);
  }

  onEditSupplier(id: string, event: Event) {
    event.stopPropagation();
    this.editSupplier.emit(id);
  }
}
