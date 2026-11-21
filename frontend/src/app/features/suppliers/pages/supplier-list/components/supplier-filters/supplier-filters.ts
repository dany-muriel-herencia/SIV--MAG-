import { Component, input, output } from '@angular/core';
import { SearchInput } from '../../../../../../shared/components/search-input/search-input';
import { SegmentedControlComponent } from "../../../../../../shared/components/segmented-control/segmented-control";
import { statusOptions } from '../../../../../../shared/models/segmented-control.model';

@Component({
  selector: 'app-supplier-filters',
  imports: [SearchInput, SegmentedControlComponent],
  templateUrl: './supplier-filters.html',
})
export class SupplierFilters {
  // Inputs
  readonly search = input<string>('');
  readonly selectedStatus = input<boolean | undefined>(undefined);

  // Outputs
  readonly searchChange = output<string>();
  readonly statusChange = output<boolean | undefined>();

  readonly statusOptions = statusOptions;
}
