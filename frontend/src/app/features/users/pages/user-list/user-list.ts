import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../core/auth/auth.service';
import { useSearchState } from '../../../../shared/utils/use-search-state';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { MetricCards } from '../../../../shared/components/metric-cards/metric-cards';
import { TableSkeleton } from '../../../../shared/components/table-skeleton/table-skeleton';
import { Pagination } from '../../../../shared/components/pagination/pagination';
import { UserFilters } from './components/user-filters/user-filters';
import { UserTable } from './components/user-table/user-table';
import { UserRole } from '../../models/user.model';
import { useToggleUserActiveMutation, useUsersQuery } from '../../queries/users.queries';

@Component({
  selector: 'app-user-list',
  imports: [
    FormsModule,
    PageHeader,
    MetricCards,
    UserFilters,
    UserTable,
    TableSkeleton,
    Pagination,
  ],
  templateUrl: './user-list.html',
})
export class UserList {
  private readonly router = inject(Router);
  readonly isAdmin = inject(AuthService).isAdmin();

  readonly filterActive = signal<boolean | undefined>(undefined);
  readonly filterRole = signal<UserRole | undefined>(undefined);
  readonly currentPage = signal(1);
  readonly pageSize = 10;

  readonly searchState = useSearchState({
    currentPage: this.currentPage,
    debounceMs: 350,
  });
  readonly search = this.searchState.search;
  readonly debouncedSearch = this.searchState.debouncedSearch;

  readonly usersQuery = useUsersQuery();
  readonly toggleActiveMutation = useToggleUserActiveMutation();

  readonly allUsers = computed(() => this.usersQuery.data() ?? []);

  readonly filteredUsers = computed(() => {
    let items = this.allUsers();

    const searchTerm = this.debouncedSearch().trim().toLowerCase();
    if (searchTerm) {
      items = items.filter(
        (u) =>
          u.fullName.toLowerCase().includes(searchTerm) ||
          u.username.toLowerCase().includes(searchTerm),
      );
    }

    const activeStatus = this.filterActive();
    if (activeStatus !== undefined) {
      items = items.filter((u) => u.isActive === activeStatus);
    }

    const role = this.filterRole();
    if (role) {
      items = items.filter((u) => u.role === role);
    }

    return items;
  });

  readonly totalCount = computed(() => this.filteredUsers().length);
  readonly totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize) || 1);

  readonly paginatedUsers = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(startIndex, startIndex + this.pageSize);
  });

  readonly activesCount = computed(() => this.allUsers().filter((u) => u.isActive).length);
  readonly inactivesCount = computed(() => this.allUsers().filter((u) => !u.isActive).length);

  readonly isLoading = computed(() => this.usersQuery.isLoading());
  readonly isRefetching = computed(
    () => this.usersQuery.isFetching() && !this.usersQuery.isLoading(),
  );

  readonly error = computed(() => {
    const usersErr = this.usersQuery.error() as any;
    const mutErr = this.toggleActiveMutation.error() as any;
    const err = mutErr || usersErr;
    if (!err) return null;

    return err?.error?.message || err?.message || 'Ocurrió un error al procesar los usuarios.';
  });

  onSearch(search: string): void {
    this.search.set(search);
    this.currentPage.set(1);
  }

  onActiveFilter(filter: boolean | undefined): void {
    this.filterActive.set(filter);
    this.currentPage.set(1);
  }

  onRoleFilter(role: UserRole | undefined): void {
    this.filterRole.set(role);
    this.currentPage.set(1);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  toggleActive(id: string): void {
    this.toggleActiveMutation.mutate(id);
  }

  openUser(id: string): void {
    this.router.navigate(['/users', id]);
  }

  editUser(id: string): void {
    this.router.navigate(['/users', id]);
  }

  newUser(): void {
    this.router.navigate(['/users/new']);
  }
}