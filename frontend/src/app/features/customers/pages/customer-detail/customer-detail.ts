import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  injectMutation,
  injectQuery,
  keepPreviousData,
  QueryClient,
} from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

import { CustomersService } from '../../services/customers.service';
import { SalesService } from '../../../sales/services/sales.service';
import { CustomerInfoCard } from './components/customer-info-card/customer-info-card';
import { CustomerPaymentForm } from './components/customer-payment-form/customer-payment-form';
import { CustomerSalesHistory } from './components/customer-sales-history/customer-sales-history';
import { CustomerPaymentsHistory } from './components/customer-payments-history/customer-payments-history';
import { CreditPaymentService } from '../../../credit-payment/credit-payment.service';
import { CreateCreditPaymentRequest } from '../../../credit-payment/models/credit-payment';

@Component({
  selector: 'app-customer-detail',
  imports: [
    CustomerInfoCard,
    CustomerPaymentForm,
    CustomerSalesHistory,
    CustomerPaymentsHistory,
  ],
  templateUrl: './customer-detail.html',
})
export class CustomerDetail {
  private readonly customersService = inject(CustomersService);
  private readonly salesService = inject(SalesService);
  private readonly creditPaymentService = inject(CreditPaymentService);
  private readonly queryClient = inject(QueryClient);
  private readonly router = inject(Router);

  readonly paymentFormRef = viewChild<CustomerPaymentForm>(CustomerPaymentForm);

  // 1. Input desde la Ruta
  readonly id = input.required<string>();

  // 2. Estado de Pestañas
  readonly activeTab = signal<'sales' | 'payments'>('sales');

  // 3. Estado de Paginación y Filtros
  readonly salesPage = signal<number>(1);
  readonly paymentsPage = signal<number>(1);
  readonly dateFrom = signal<string | undefined>(undefined);
  readonly dateTo = signal<string | undefined>(undefined);

  readonly paymentSuccess = signal<string | null>(null);

  // Query 1: Información Principal del Cliente
  readonly customerQuery = injectQuery(() => ({
    queryKey: ['customers', this.id()],
    queryFn: () => firstValueFrom(this.customersService.getById(this.id())),
    staleTime: 1000 * 60 * 5,
  }));

  // Query 2: Ventas Paginadas del Cliente
  readonly salesQuery = injectQuery(() => ({
    queryKey: ['sales', 'customer', this.id(), { page: this.salesPage(), pageSize: 5 }],
    queryFn: () =>
      firstValueFrom(
        this.salesService.getPaged({
          page: this.salesPage(),
          pageSize: 5,
          customerId: this.id(),
        }),
      ),
    placeholderData: keepPreviousData,
  }));

  // Query 3: Historial de Abonos / Pagos del Cliente con Filtros de Fecha
  readonly paymentsQuery = injectQuery(() => ({
    queryKey: [
      'payments',
      'customer',
      this.id(),
      {
        page: this.paymentsPage(),
        pageSize: 5,
        from: this.dateFrom(),
        to: this.dateTo(),
      },
    ],
    queryFn: () =>
      firstValueFrom(
        this.creditPaymentService.getPaged({
          page: this.paymentsPage(),
          pageSize: 5,
          customerId: this.id(),
          from: this.dateFrom(),
          to: this.dateTo(),
        }),
      ),
    placeholderData: keepPreviousData,
  }));

  readonly paymentMutation = injectMutation(() => ({
    mutationFn: (request: CreateCreditPaymentRequest) =>
      firstValueFrom(this.creditPaymentService.processPayment(request)),
    onSuccess: (_, variables) => {
      this.paymentSuccess.set(`Abono de S/ ${variables.amount.toFixed(2)} registrado con éxito.`);
      this.paymentFormRef()?.resetForm();

      // Invalida la información del cliente (recalcula deuda), ventas y pagos
      this.queryClient.invalidateQueries({ queryKey: ['customers'] });
      this.queryClient.invalidateQueries({ queryKey: ['sales'] });
      this.queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  }));

  // Cliente
  readonly customer = computed(() => this.customerQuery.data() ?? null);
  readonly isLoading = computed(() => this.customerQuery.isLoading());
  readonly error = computed(
    () =>
      (this.customerQuery.error() as any)?.error?.message ||
      this.customerQuery.error()?.message ||
      null,
  );

  // Ventas
  readonly sales = computed(() => this.salesQuery.data()?.items ?? []);
  readonly salesTotalCount = computed(() => this.salesQuery.data()?.totalCount ?? 0);
  readonly salesTotalPages = computed(() => this.salesQuery.data()?.totalPages ?? 0);
  readonly salesLoading = computed(() => this.salesQuery.isFetching());

  // Pagos
  readonly payments = computed(() => this.paymentsQuery.data()?.items ?? []);
  readonly paymentsTotalCount = computed(() => this.paymentsQuery.data()?.totalCount ?? 0);
  readonly paymentsTotalPages = computed(() => this.paymentsQuery.data()?.totalPages ?? 0);
  readonly paymentsLoading = computed(() => this.paymentsQuery.isFetching());

  // Estado del Pago
  readonly isSavingPayment = computed(() => this.paymentMutation.isPending());
  readonly paymentError = computed(() => {
    const err = this.paymentMutation.error() as any;
    return err?.error?.message || err?.message || null;
  });

  setActiveTab(tab: 'sales' | 'payments'): void {
    this.activeTab.set(tab);
  }

  onSalesPageChange(page: number): void {
    this.salesPage.set(page);
  }

  onPaymentsPageChange(page: number): void {
    this.paymentsPage.set(page);
  }

  onPaymentsDateFilter(filter: { from?: string; to?: string }): void {
    this.dateFrom.set(filter.from);
    this.dateTo.set(filter.to);
    this.paymentsPage.set(1);
  }

  onClearPaymentFilters(): void {
    this.dateFrom.set(undefined);
    this.dateTo.set(undefined);
    this.paymentsPage.set(1);
  }

  onSubmitPayment(data: CreateCreditPaymentRequest): void {
    this.paymentSuccess.set(null);
    this.paymentMutation.mutate(data);
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }

  openSale(saleId: string): void {
    this.router.navigate(['/sales', saleId]);
  }
}
