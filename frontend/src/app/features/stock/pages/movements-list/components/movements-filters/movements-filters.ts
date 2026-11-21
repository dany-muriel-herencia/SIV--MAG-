import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectorComponent } from '../../../../../../shared/components/selector/selector';
import { AutocompleteInputComponent } from '../../../../../../shared/components/autocomplete-input/autocomplete-input';
import { Product } from '../../../../../products/models/product.model';
import { MovementType } from '../../../../models/stock.model';

export interface StatusOption {
  id: MovementType;
  name: string;
}

@Component({
  selector: 'app-movements-filters',
  imports: [CommonModule, FormsModule, SelectorComponent, AutocompleteInputComponent],
  templateUrl: './movements-filters.html',
})
export class MovementsFilters {
  readonly hasActiveFilters = input<boolean>(false);
  readonly filterType = input<MovementType | undefined>(undefined);
  readonly fromDate = input<string>('');
  readonly toDate = input<string>('');
  readonly selectedProduct = input<Product | null>(null);
  readonly productResults = input<Product[]>([]);
  readonly isSearchingProduct = input<boolean>(false);

  readonly typeChange = output<MovementType | undefined>();
  readonly fromDateChange = output<string>();
  readonly toDateChange = output<string>();
  readonly productChange = output<Product | null>();
  readonly productQueryChange = output<string>();

  readonly clearFilters = output<void>();

  protected readonly statusOptions: StatusOption[] = [
    { id: MovementType.CompraProveedor, name: 'Compra Proveedor' },
    { id: MovementType.AjustePositivo, name: 'Ajuste Positivo' },
    { id: MovementType.Venta, name: 'Venta' },
    { id: MovementType.AjusteNegativo, name: 'Ajuste Negativo' },
    { id: MovementType.DevolucionVenta, name: 'Devolución Venta' },
    { id: MovementType.DevolucionCompra, name: 'Devolución Compra' },
  ];

  protected readonly currentTypeObject = computed<StatusOption | null>(() => {
    const type = this.filterType();
    if (type === undefined) return null;
    return this.statusOptions.find((opt) => opt.id === type) ?? null;
  });

  protected onTypeChange(option: StatusOption | null): void {
    this.typeChange.emit(option ? option.id : undefined);
  }
}
