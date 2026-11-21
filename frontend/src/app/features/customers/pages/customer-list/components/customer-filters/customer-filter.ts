import { Component, input, output } from '@angular/core';
import { SearchInput } from '../../../../../../shared/components/search-input/search-input';
import { SegmentedControlComponent } from '../../../../../../shared/components/segmented-control/segmented-control';
import { statusOptions } from '../../../../../../shared/models/segmented-control.model';

@Component({
  selector: 'app-customer-filters',
  imports: [SearchInput, SegmentedControlComponent],
  templateUrl: './customer-filter.html',
})
export class CustomerFilters {
  // Inputs
  readonly search = input<string>('');
  readonly hasDebt = input<boolean | undefined>(undefined);
  readonly selectedStatus = input<boolean | undefined>(undefined);

  // Outputs
  readonly searchChange = output<string>();
  readonly statusChange = output<boolean | undefined>();
  readonly debtFilter = output<boolean | undefined>();

  readonly statusOptions = statusOptions;
}
