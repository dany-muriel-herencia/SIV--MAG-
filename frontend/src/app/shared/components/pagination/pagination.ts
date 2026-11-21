import { Component, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.html',
})
export class Pagination {
  // Inputs
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  totalCount = input.required<number>();
  pageSize = input(10);
  itemLabel = input('registros');

  // Output
  pageChange = output<number>();

  // Páginas visibles — máximo 5 para no romper el diseño
  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // Centrar la página actual
    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + 4);

    // Ajustar si estamos cerca del final
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  showFirstEllipsis = computed(() => this.visiblePages()[0] > 1);

  showLastEllipsis = computed(() => {
    const pages = this.visiblePages();
    return pages[pages.length - 1] < this.totalPages();
  });

  // Rango de registros mostrados
  rangeStart = computed(() => (this.currentPage() - 1) * this.pageSize() + 1);

  rangeEnd = computed(() => Math.min(this.currentPage() * this.pageSize(), this.totalCount()));

  onPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    if (page === this.currentPage()) return;
    this.pageChange.emit(page);
  }
}
