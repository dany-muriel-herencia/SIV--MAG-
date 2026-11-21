import { Component, input, output } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { Pagination } from '../../../../../../shared/components/pagination/pagination';
import { PurchaseStatus, PurchaseSummary, PURCHASE_STATUS_BADGE } from '../../../../models/purchase.model';
import { TableSkeleton } from '../../../../../../shared/components/table-skeleton/table-skeleton';
import { BadgeComponent } from '../../../../../../shared/components/badge/badge';

@Component({
  selector: 'app-purchase-table',
  imports: [CommonModule, DecimalPipe, DatePipe, Pagination, BadgeComponent, TableSkeleton],
  templateUrl: './purchase-table.html',
})
export class PurchaseTableComponent {
  readonly purchases = input.required<PurchaseSummary[]>();
  readonly isLoading = input<boolean>(false);
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(1);
  readonly totalCount = input<number>(0);
  readonly pageSize = input<number>(10);

  readonly rowClick = output<string>();
  readonly pageChange = output<number>();

  getBadgeConfig(status: PurchaseStatus) {
    return (
      PURCHASE_STATUS_BADGE[status] ?? {
        label: 'Desconocido',
        class: 'bg-slate-100 text-slate-600',
      }
    );
  }
}
