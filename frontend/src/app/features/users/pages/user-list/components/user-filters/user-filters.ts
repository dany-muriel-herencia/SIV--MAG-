import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchInput } from '../../../../../../shared/components/search-input/search-input';
import { SegmentedControlComponent } from '../../../../../../shared/components/segmented-control/segmented-control';
import { roleOptions, statusOptions } from '../../../../../../shared/models/segmented-control.model';
import { UserRole } from '../../../../models/user.model';

@Component({
  selector: 'app-user-filters',
  imports: [FormsModule, SearchInput, SegmentedControlComponent],
  templateUrl: './user-filters.html',
})
export class UserFilters {
  readonly search = input<string>('');
  readonly selectedStatus = input<boolean | undefined>(undefined);
  readonly selectedRole = input<UserRole | undefined>(undefined);

  readonly searchChange = output<string>();
  readonly statusChange = output<boolean | undefined>();
  readonly roleChange = output<UserRole | undefined>();

  readonly statusOptions = statusOptions;
  readonly roleOptions = roleOptions;
}
