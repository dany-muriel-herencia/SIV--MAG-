import { Component, input, output, inject } from '@angular/core';
import { Customer } from '../../../../models/customer.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-customer-table',
  imports: [DecimalPipe],
  templateUrl: './customer-table.html',
})
export class CustomerTable {
  readonly customers = input.required<Customer[]>();
  readonly isRefetching = input<boolean>();
  readonly isAdmin = input<boolean>(false);

  readonly openCustomer = output<string>();
  readonly editCustomer = output<string>();
  readonly toggleActive = output<string>();

  onToggleActive(id: string, event: Event): void {
    event.stopPropagation();
    this.toggleActive.emit(id);
  }

  openCustomerDetail(id: string) {
    this.openCustomer.emit(id);
  }

  onEditCustomer(id: string, event: Event) {
    event.stopPropagation();
    this.editCustomer.emit(id);
  }
}
