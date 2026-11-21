import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { AuthService } from '../../../../core/auth/auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { TableSkeleton } from '../../../../shared/components/table-skeleton/table-skeleton';
import { CategoryTable } from './components/category-table/category-table';
import { CategoryFilters } from './components/category-filters/category-filters';
import {
  useCategoriesQuery,
  useToggleCategoriesActiveMutation,
} from '../../queries/categories.queries';

@Component({
  selector: 'app-category-list',
  imports: [FormsModule, Pagination, PageHeader, TableSkeleton, CategoryTable, CategoryFilters],
  templateUrl: './category-list.html',
})
export class CategoryList {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  search = signal('');
  filterActive = signal<boolean | undefined>(undefined);
  currentPage = signal(1);
  readonly pageSize = 10;

  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(debounceTime(350), distinctUntilChanged()),
    { initialValue: '' },
  );

  private readonly queryParams = computed(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize,
    search: this.debouncedSearch().trim() || undefined,
    isActive: this.filterActive(),
  }));

  private readonly categoriesQuery = useCategoriesQuery(this.queryParams);
  private readonly toggleActiveMutation = useToggleCategoriesActiveMutation();

  result = this.categoriesQuery.data;
  isLoading = computed(() => this.categoriesQuery.isLoading());
  isSearching = computed(() => this.categoriesQuery.isFetching() && !this.result());

  error = computed(() => {
    const catErr = this.categoriesQuery.error() as any;
    const mutErr = this.toggleActiveMutation.error() as any;
    const err = mutErr || catErr;
    if (!err) return null;
    return err?.error?.message || err?.message || 'No se pudieron cargar las categorías.';
  });

  categories = computed(() => this.result()?.items ?? []);
  totalCount = computed(() => this.result()?.totalCount ?? 0);
  totalPages = computed(() => this.result()?.totalPages ?? 0);
  activesCount = computed(() => this.result()?.activesCount ?? 0);
  inactivesCount = computed(() => this.result()?.inactivesCount ?? 0);

  onSearch(search: string) {
    this.search.set(search);
    this.currentPage.set(1);
  }

  onActiveFilter(filter: boolean | undefined) {
    this.filterActive.set(filter);
    this.currentPage.set(1);
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onToggleActive(categoryId: string) {
    this.toggleActiveMutation.mutate(categoryId);
  }

  onOpenClick(categoryId: string) {
    this.router.navigate(['/categories', categoryId]);
  }

  newCategory(): void {
    this.router.navigate(['/categories/new']);
  }
}
