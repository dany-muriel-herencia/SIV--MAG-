import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from '../models/product.model';
import { PagedResultWithStatus } from '../../../shared/models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getPaged(
    filters: {
      page?: number;
      pageSize?: number;
      search?: string;
      categoryId?: string;
      supplierId?: string;
      isActive?: boolean;
      lowStock?: boolean;
    } = {},
  ) {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('pageSize', filters.pageSize ?? 10);

    if (filters.search) params = params.set('search', filters.search);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.supplierId) params = params.set('supplierId', filters.supplierId);
    if (filters.isActive !== undefined) params = params.set('isActive', filters.isActive);
    if (filters.lowStock !== undefined) params = params.set('lowStock', filters.lowStock);

    return this.http.get<PagedResultWithStatus<Product>>(this.baseUrl, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  getLowStock() {
    return this.http.get<Product[]>(`${this.baseUrl}/low-stock`);
  }

  create(product: CreateProductRequest) {
    return this.http.post<Product>(this.baseUrl, product);
  }

  update(id: string, product: UpdateProductRequest) {
    return this.http.patch<Product>(`${this.baseUrl}/${id}`, product);
  }

  toggleActive(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/toggle-active`, {});
  }
}
