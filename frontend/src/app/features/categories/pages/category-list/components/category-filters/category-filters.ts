import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchInput } from '../../../../../../shared/components/search-input/search-input';
import { SegmentedControlComponent } from '../../../../../../shared/components/segmented-control/segmented-control';
import { SegmentedOption } from '../../../../../../shared/models/segmented-control.model';

@Component({
  selector: 'app-category-filters',
  imports: [FormsModule, SearchInput, SegmentedControlComponent],
  templateUrl: './category-filters.html',
})
export class CategoryFilters {
  readonly search = input<string>('');
  readonly statusFilter = input<boolean | undefined>();
  readonly totalCount = input<number>();
  readonly activesCount = input<number>();
  readonly inactivesCount = input<number>();

  readonly searchChange = output<string>();
  readonly statusFilterChange = output<boolean | undefined>();

  protected readonly statusOptions = computed<SegmentedOption<boolean | undefined>[]>(() => [
    { 
      label: 'Todos', 
      value: undefined, 
      count: this.totalCount() 
    },
    { 
      label: 'Activos', 
      value: true, 
      icon: 'pi pi-circle-fill text-emerald-500', 
      activeClass: 'text-emerald-700 border-emerald-200',
      count: this.activesCount() 
    },
    { 
      label: 'Inactivos', 
      value: false, 
      icon: 'pi pi-circle-fill text-rose-500', 
      activeClass: 'text-rose-700 border-rose-200',
      count: this.inactivesCount() 
    },
  ]);
}
