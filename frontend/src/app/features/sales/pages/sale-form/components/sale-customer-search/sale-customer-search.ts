import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { useCustomerSearchQuery } from '../../../../../../shared/queries/customer.queries';
import { Customer } from '../../../../../customers/models/customer.model';

@Component({
  selector: 'app-sale-customer-search',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="bg-white rounded-xl border border-slate-100 p-4 space-y-3 relative z-20 shadow-sm">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-700">Cliente</h2>
        @if (selectedCustomer()) {
          <span class="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            Asignado
          </span>
        }
      </div>

      <!-- Buscador de cliente (visible si no hay cliente seleccionado o para cambiarlo) -->
      @if (!selectedCustomer()) {
        <div class="relative">
          <i class="pi pi-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          <input
            type="text"
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Buscar cliente por nombre o DNI/RUC..."
            class="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          @if (isSearching()) {
            <i class="pi pi-spin pi-spinner absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          }
        </div>

        <!-- Resultados de clientes flotantes -->
        @if (searchResults().length > 0) {
          <div
            class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-100 rounded-lg shadow-xl overflow-hidden divide-y divide-slate-50 z-20 max-h-52 overflow-y-auto animate-fade-in"
          >
            @for (customer of searchResults(); track customer.id) {
              <button
                type="button"
                (click)="selectCustomer(customer)"
                class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <div>
                  <p class="text-sm font-medium text-slate-700">
                    {{ customer.fullName }}
                  </p>
                  @if (customer.hasDebt) {
                    <p class="text-xs text-amber-500 font-medium">
                      Deuda: S/ {{ customer.currentDebt | number: '1.2-2' }}
                    </p>
                  }
                </div>
                @if (!customer.isActive) {
                  <span class="text-xs text-red-400">Inactivo</span>
                }
              </button>
            }
          </div>
        }
      }

      <!-- Cliente seleccionado Card -->
      @if (selectedCustomer(); as customer) {
        <div class="flex items-center justify-between p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
          <div class="space-y-0.5">
            <p class="text-sm font-semibold text-blue-900">
              {{ customer.fullName }}
            </p>
            @if (customer.hasDebt) {
              <p class="text-xs text-amber-700 font-medium">
                Deuda actual: S/ {{ customer.currentDebt | number: '1.2-2' }}
              </p>
            }
            @if (customer.availableCredit !== undefined && customer.availableCredit !== null) {
              <p class="text-xs text-blue-700">
                Crédito disponible: S/ {{ customer.availableCredit | number: '1.2-2' }}
              </p>
            }
          </div>
          <button
            type="button"
            (click)="clearCustomer()"
            aria-label="Quitar cliente"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-blue-400 hover:text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <i class="pi pi-times text-xs"></i>
          </button>
        </div>
      }
    </div>
  `,
})
export class SaleCustomerSearch {
  readonly selectedCustomer = input<Customer | null>(null);

  readonly customerSelected = output<Customer>();
  readonly customerCleared = output<void>();

  readonly searchTerm = signal('');

  private readonly customersQuery = useCustomerSearchQuery(this.searchTerm);

  readonly searchResults = computed<Customer[]>(() => {
    if (this.searchTerm().trim().length < 2) return [];
    return this.customersQuery.data() ?? [];
  });

  readonly isSearching = computed(
    () => this.searchTerm().trim().length >= 2 && this.customersQuery.isFetching()
  );

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  selectCustomer(customer: Customer): void {
    this.customerSelected.emit(customer);
    this.searchTerm.set('');
  }

  clearCustomer(): void {
    this.searchTerm.set('');
    this.customerCleared.emit();
  }
}
