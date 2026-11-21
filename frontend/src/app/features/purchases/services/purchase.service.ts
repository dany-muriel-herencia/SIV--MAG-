import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PagedResult } from '../../../shared/models/paged-result.model';
import {
  Purchase,
  PurchaseSummary,
  PurchaseStatus,
  CreatePurchaseRequest,
  ReceivePurchaseRequest,
} from '../models/purchase.model';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/purchases`;

  getPaged(
    filters: {
      page?: number;
      pageSize?: number;
      supplierId?: string;
      status?: PurchaseStatus;
      from?: string;
      to?: string;
    } = {},
  ) {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('pageSize', filters.pageSize ?? 10);

    if (filters.supplierId) params = params.set('supplierId', filters.supplierId);
    if (filters.status !== undefined) params = params.set('status', filters.status);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);

    return this.http.get<PagedResult<PurchaseSummary>>(this.baseUrl, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<Purchase>(`${this.baseUrl}/${id}`);
  }

  create(request: CreatePurchaseRequest) {
    return this.http.post<Purchase>(this.baseUrl, request);
  }

  receive(id: string, request: ReceivePurchaseRequest) {
    return this.http.patch<Purchase>(`${this.baseUrl}/${id}/receive`, request);
  }

  cancel(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/cancel`, {});
  }
}
