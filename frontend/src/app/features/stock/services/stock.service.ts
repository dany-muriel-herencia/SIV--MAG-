import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { ManualAdjustmentRequest, MovementType, StockMovement } from '../models/stock.model';


@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/stock`;

  getMovements(
    filters: {
      page?: number;
      pageSize?: number;
      productId?: string;
      type?: MovementType | null;
      from?: string;
      to?: string;
    } = {},
  ) {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('pageSize', filters.pageSize ?? 15);

    if (filters.productId) params = params.set('productId', filters.productId);
    if (filters.type !== undefined && filters.type !== null) {
      params = params.set('type', filters.type.toString());
    }
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);

    return this.http.get<PagedResult<StockMovement>>(`${this.baseUrl}/movements`, { params });
  }

  manualAdjustment(request: ManualAdjustmentRequest) {
    return this.http.post(`${this.baseUrl}/adjustments`, request);
  }
}
