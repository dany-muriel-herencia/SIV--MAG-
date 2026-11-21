import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PagedResultWithStatus } from '../../../shared/models/paged-result.model';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  getPaged(filter: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 10);
    if (filter.search?.trim()) {
      params = params.set('search', filter.search.trim());
    }
    if (filter.isActive !== undefined && filter.isActive !== null) {
      params = params.set('isActive', filter.isActive);
    }
    return this.http.get<PagedResultWithStatus<Category>>(this.baseUrl, {
      params,
    });
  }

  getById(id: string) {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  create(category: CreateCategoryRequest) {
    return this.http.post(this.baseUrl, category);
  }

  update(id: string, category: UpdateCategoryRequest) {
    return this.http.patch(`${this.baseUrl}/${id}`, category);
  }

  toggleActive(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/toggle-active`, {});
  }
}
