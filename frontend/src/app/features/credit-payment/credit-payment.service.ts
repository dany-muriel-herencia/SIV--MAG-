import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../../shared/models/paged-result.model';
import { CancelCreditPaymentRequest, CreateCreditPaymentRequest, CreditPaymentResponse } from './models/credit-payment';

@Injectable({ providedIn: 'root' })
export class CreditPaymentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/creditpayments`;

  getPaged(
    filters: {
      page?: number;
      pageSize?: number;
      customerId?: string
      cashRegisterId?: string
      from?:string;
      to?:string;
    } = {},
  ) {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('pageSize', filters.pageSize ?? 10);

    if (filters.customerId) params = params.set('customerId', filters.customerId);
    if (filters.cashRegisterId) params = params.set('cashRegisterId', filters.cashRegisterId);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);

    return this.http.get<PagedResult<CreditPaymentResponse>>(this.baseUrl, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<CreditPaymentResponse>(`${this.baseUrl}/${id}`);
  }

  getPayments(
    id: string,
    filters: {
      page?: number;
      pageSize?: number;
      from?: string;
      to?: string;
    } = {},
  ) {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('pageSize', filters.pageSize ?? 10);

    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);

    return this.http.get<PagedResult<CreditPaymentResponse>>(`${this.baseUrl}/${id}/payments`, {
      params,
    });
  }

  processPayment(data: CreateCreditPaymentRequest ) {
    return this.http.post<CreditPaymentResponse>(this.baseUrl, data );
  }

  cancelPayment(paymentId: string, data: CancelCreditPaymentRequest ) {
    return this.http.patch<CreditPaymentResponse>(`${this.baseUrl}/${paymentId}/cancel`, data );
  }

}
