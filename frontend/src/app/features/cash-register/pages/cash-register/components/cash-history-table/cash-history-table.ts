import { Component, computed, input, signal } from '@angular/core';
import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { CashRegisterResponse } from '../../../../models/cash-register.model';
import { SegmentedControlComponent } from '../../../../../../shared/components/segmented-control/segmented-control';
import { SegmentedOption } from '../../../../../../shared/models/segmented-control.model';
import { SearchInput } from '../../../../../../shared/components/search-input/search-input';

type CashStatusFilter = 'all' | 'open' | 'closed';

@Component({
  selector: 'app-cash-history-table',
  imports: [DatePipe, DecimalPipe, UpperCasePipe, SegmentedControlComponent, SearchInput],
  templateUrl: './cash-history-table.html',
})
export class CashHistoryTable {
  readonly title = input<string>('Historial de Cajas');
  readonly subtitle = input<string>('Registros de cierres y turnos anteriores');
  readonly showUserColumn = input<boolean>(true);
  readonly records = input<CashRegisterResponse[]>([]);

  // Filtros locales
  protected readonly searchTerm = signal<string>('');
  protected readonly statusFilter = signal<CashStatusFilter>('all');

  // Opciones computadas para el filtro segmentado
  protected readonly statusOptions: SegmentedOption<CashStatusFilter>[] = [
    { label: 'Todos', value: 'all' },
    {
      label: 'Abiertos',
      value: 'open',
      icon: 'pi pi-circle-fill text-emerald-500',
      activeClass: 'text-emerald-700 border-emerald-200',
    },
    { label: 'Cerrados', value: 'closed', icon: 'pi pi-circle-fill text-slate-400' },
  ];

  // Registro seleccionado para modal
  protected readonly selectedRecord = signal<CashRegisterResponse | null>(null);

  // Paginación local
  protected readonly currentPage = signal<number>(1);
  protected readonly pageSize = signal<number>(10);

  protected readonly filteredRecords = computed(() => {
    let list = this.records();
    const search = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    if (status === 'open') {
      list = list.filter((r) => r.isOpen);
    } else if (status === 'closed') {
      list = list.filter((r) => !r.isOpen);
    }

    if (search) {
      list = list.filter(
        (r) =>
          r.userFullName?.toLowerCase().includes(search) ||
          r.id.toLowerCase().includes(search) ||
          r.openingNotes?.toLowerCase().includes(search) ||
          r.closingNotes?.toLowerCase().includes(search),
      );
    }

    return list;
  });

  protected readonly totalPages = computed(() => {
    const total = this.filteredRecords().length;
    return Math.max(1, Math.ceil(total / this.pageSize()));
  });

  protected readonly paginatedRecords = computed(() => {
    const list = this.filteredRecords();
    const page = Math.min(this.currentPage(), this.totalPages());
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });

  protected onStatusChange(status: CashStatusFilter): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
  }

  protected prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }

  protected nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  protected viewDetail(item: CashRegisterResponse): void {
    this.selectedRecord.set(item);
  }

  protected closeDetail(): void {
    this.selectedRecord.set(null);
  }
}
