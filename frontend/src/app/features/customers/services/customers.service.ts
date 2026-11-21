import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  CreateCustomerRequest,
  Customer,
  UpdateCustomerRequest,
} from '../models/customer.model';
import { PagedResultWithStatus } from '../../../shared/models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/customers`;

  getPaged(
    filters: {
      page?: number;
      pageSize?: number;
      search?: string;
      hasDebt?: boolean;
      isActive?: boolean;
    } = {},
  ) {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('pageSize', filters.pageSize ?? 10);

    if (filters.search) params = params.set('search', filters.search);
    if (filters.hasDebt !== undefined) params = params.set('hasDebt', filters.hasDebt);
    if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive);

    return this.http.get<PagedResultWithStatus<Customer>>(this.baseUrl, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<Customer>(`${this.baseUrl}/${id}`);
  }

  create(data: CreateCustomerRequest) {
    return this.http.post<Customer>(this.baseUrl, data);
  }

  update(id: string, data: UpdateCustomerRequest) {
    return this.http.put<Customer>(`${this.baseUrl}/${id}`, data);
  }

  toggleActive(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/toggle-active`, {});
  }
  // Búsqueda rápida para el selector del POS
  search(query: string) {
    return this.http.get<PagedResultWithStatus<Customer>>(this.baseUrl, {
      params: {
        search: query,
        page: 1,
        pageSize: 10,
        isActive: true,
      },
    });
  }
}
