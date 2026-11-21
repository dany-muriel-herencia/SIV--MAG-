import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectorComponent } from '../../../../../../shared/components/selector/selector';
import { Customer } from '../../../../../customers/models/customer.model';
import { User } from '../../../../../users/models/user.model';
import { SaleStatus } from '../../../../models/sale.model';

export interface StatusOption {
  id: SaleStatus;
  name: string;
}

@Component({
  selector: 'app-sale-filters',
  imports: [FormsModule, SelectorComponent],
  template: `
    <div class="bg-white rounded-xl border border-slate-100 p-4">
      <div class="flex flex-wrap gap-3 items-end">
        <!-- Desde -->
        <div>
          <label class="block text-xs text-slate-500 font-semibold mb-1.5">Desde</label>
          <input
            type="date"
            [ngModel]="fromDate()"
            (ngModelChange)="fromDateChange.emit($event)"
            class="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-700 transition-all"
          />
        </div>

        <!-- Hasta -->
        <div>
          <label class="block text-xs text-slate-500 font-semibold mb-1.5">Hasta</label>
          <input
            type="date"
            [ngModel]="toDate()"
            (ngModelChange)="toDateChange.emit($event)"
            class="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-700 transition-all"
          />
        </div>

        <div class="w-48">
          <app-selector
            [ngModel]="currentStatusObject()"
            (ngModelChange)="onStatusChange($event)"
            title="Estado de la venta"
            placeholder="Todos los estados"
            icon="pi pi-filter"
            trackByKey="id"
            labelKey="name"
            [options]="statusOptions"
          />
        </div>

        <div class="w-48">
          <app-selector
            [ngModel]="currentCustomerObject()"
            (ngModelChange)="onCustomerChange($event)"
            title="Cliente"
            placeholder="Todos los clientes"
            icon="pi pi-users"
            trackByKey="id"
            labelKey="fullName"
            [options]="customers()"
          />
        </div>

        @if(isAdmin()){
        <div class="w-48">
          <app-selector
            [ngModel]="currentUserObject()"
            (ngModelChange)="onUserChange($event)"
            title="Vendedor"
            placeholder="Todos los vendedores"
            icon="pi pi-user"
            trackByKey="id"
            labelKey="fullName"
            [options]="users()"
          />
        </div>
        }
      </div>
    </div>
  `,
})
export class SaleFilters {
  readonly fromDate = input<string>('');
  readonly toDate = input<string>('');
  readonly filterStatus = input<SaleStatus | undefined>(undefined);
  readonly filterCustomer = input<string | undefined>(undefined);
  readonly customers = input<Customer[]>([]);
  readonly filterUser = input<string | undefined>(undefined);
  readonly users = input<User[]>([]);
  readonly isAdmin = input<boolean>(false);

  readonly fromDateChange = output<string>();
  readonly toDateChange = output<string>();
  readonly statusChange = output<SaleStatus | undefined>();
  readonly customerChange = output<string>();
  readonly userChange = output<string>();


  readonly currentCustomerObject = computed<Customer | null>(() => {
    const customer = this.filterCustomer();
    if (customer === undefined) return null;
    return this.customers().find((opt) => opt.id === customer) ?? null;
  });

  protected onCustomerChange(option: Customer | null): void {
    this.customerChange.emit(option ? option.id : '');
  }

  protected readonly currentUserObject = computed<User | null>(() => {
    const user = this.filterUser();
    if (user === undefined) return null;
    return this.users().find((opt) => opt.id === user) ?? null;
  });

  protected onUserChange(option: User | null): void {
    this.userChange.emit(option ? option.id : '');
  }

  protected readonly statusOptions: StatusOption[] = [
    { id: SaleStatus.Completada, name: 'Completada' },
    { id: SaleStatus.Cancelada, name: 'Cancelada' },
  ];

  protected readonly currentStatusObject = computed<StatusOption | null>(() => {
    const status = this.filterStatus();
    if (status === undefined) return null;
    return this.statusOptions.find((opt) => opt.id === status) ?? null;
  });

  protected onStatusChange(option: StatusOption | null): void {
    this.statusChange.emit(option ? option.id : undefined);
  }
}
