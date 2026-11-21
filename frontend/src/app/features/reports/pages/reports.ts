import { Component, computed, inject, signal } from '@angular/core';
import { SegmentedControlComponent } from '../../../shared/components/segmented-control/segmented-control';
import { SalesReportTabComponent } from '../components/sales-report-tab/sales-report-tab';
import { ValuationReportTabComponent } from '../components/valuation-report-tab/valuation-report-tab';
import { DebtReportTabComponent } from '../components/debt-report-tab/debt-report-tab';
import { SegmentedOption } from '../../../shared/models/segmented-control.model';
import { useCustomerDebtReportQuery, useSalesReportQuery, useStockValuationQuery, useTopProductsQuery } from '../queries/reports.queries';

type ReportTab = 'sales' | 'inventory' | 'debts';

@Component({
  selector: 'app-reports',
  imports: [
    SegmentedControlComponent,
    SalesReportTabComponent,
    ValuationReportTabComponent,
    DebtReportTabComponent,
  ],
  templateUrl: './reports.html',
})
export class ReportsComponent {

  readonly activeTab = signal<ReportTab>('sales');

  readonly tabOptions: SegmentedOption<ReportTab>[] = [
    { label: 'Ventas y Utilidades', value: 'sales', icon: 'pi pi-chart-line' },
    { label: 'Valoración Stock', value: 'inventory', icon: 'pi pi-box' },
    { label: 'Cartera de Deudas', value: 'debts', icon: 'pi pi-users' },
  ];

  // Filtro de Fechas
  private readonly now = new Date();
  private readonly firstDayOfMonth = new Date(this.now.getFullYear(), this.now.getMonth(), 1);

  readonly fromDate = signal<string>(this.formatDateInput(this.firstDayOfMonth));
  readonly toDate = signal<string>(this.formatDateInput(this.now));

  readonly dateFilter = computed(() => ({
    from: this.fromDate(),
    to: this.toDate(),
  }));

  //Queries
  readonly salesSummaryQuery = useSalesReportQuery(this.dateFilter)
  readonly topProductsQuery = useTopProductsQuery(this.dateFilter)
  readonly stockValuationQuery = useStockValuationQuery()
  readonly debtReportQuery = useCustomerDebtReportQuery()

  readonly salesSummary = computed(() => this.salesSummaryQuery.data());
  readonly salesLoading = computed(
    () => this.salesSummaryQuery.isLoading() || this.salesSummaryQuery.isFetching(),
  );

  readonly topProducts = computed(() => this.topProductsQuery.data() ?? []);

  readonly valuationData = computed(() => this.stockValuationQuery.data());
  readonly valuationLoading = computed(
    () => this.stockValuationQuery.isLoading() || this.stockValuationQuery.isFetching(),
  );

  readonly debtData = computed(() => this.debtReportQuery.data());
  readonly debtLoading = computed(
    () => this.debtReportQuery.isLoading() || this.debtReportQuery.isFetching(),
  );

  setActiveTab(tab: ReportTab): void {
    this.activeTab.set(tab);
  }

  setPresetDate(preset: 'today' | 'this-month' | 'last-30-days'): void {
    const today = new Date();
    if (preset === 'today') {
      const str = this.formatDateInput(today);
      this.fromDate.set(str);
      this.toDate.set(str);
    } else if (preset === 'this-month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      this.fromDate.set(this.formatDateInput(firstDay));
      this.toDate.set(this.formatDateInput(today));
    } else if (preset === 'last-30-days') {
      const past30 = new Date(today);
      past30.setDate(past30.getDate() - 30);
      this.fromDate.set(this.formatDateInput(past30));
      this.toDate.set(this.formatDateInput(today));
    }
  }

  refreshCurrentTab(): void {
    const tab = this.activeTab();
    if (tab === 'sales') {
      this.salesSummaryQuery.refetch();
      this.topProductsQuery.refetch();
    } else if (tab === 'inventory') {
      this.stockValuationQuery.refetch();
    } else if (tab === 'debts') {
      this.debtReportQuery.refetch();
    }
  }

  private formatDateInput(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
