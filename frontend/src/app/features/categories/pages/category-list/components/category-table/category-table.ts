import { Component, input, inject, output } from '@angular/core';
import { Category } from '../../../../models/category.model';
import { AuthService } from '../../../../../../core/auth/auth.service';

@Component({
  selector: 'app-category-table',
  templateUrl: './category-table.html',
})
export class CategoryTable {
  readonly auth = inject(AuthService);
  categories = input<Category[]>([]);
  isSearching = input<boolean>(false);

  toggleActive = output<string>();
  openCategory = output<string>();

  onToggleActive(id: string, event: Event): void {
    event.stopPropagation();
    this.toggleActive.emit(id);
  }

  onOpenClick(id: string): void {
    this.openCategory.emit(id);
  }

}