import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Sale, SaleSummary, CreateSaleRequest, SaleStatus } from '../models/sale.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sales`;

  getPaged(
    filters: {
      page?: number;
      pageSize?: number;
      from?: string;
      to?: string;
      customerId?: string;
      userId?: string;
      status?: SaleStatus;
    } = {},
  ) {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('pageSize', filters.pageSize ?? 10);

    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    if (filters.customerId) params = params.set('customerId', filters.customerId);
    if (filters.userId) params = params.set('userId', filters.userId);
    if (filters.status) params = params.set('status', filters.status);

    return this.http.get<PagedResult<SaleSummary>>(this.baseUrl, { params });
  }

  getById(id: string) {
    return this.http.get<Sale>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateSaleRequest) {
    return this.http.post<Sale>(this.baseUrl, request);
  }

  cancel(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/cancel`, {});
  }
}
