import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PagedResult, PagedResultWithStatus } from '../../../shared/models/paged-result.model';
import { User, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  // getPaged(filter: { page?: number; pageSize?: number; search?: string; isActive?: boolean } = {}) {
  //   let params = new HttpParams()
  //     .set('page', filter.page ?? 1)
  //     .set('pageSize', filter.pageSize ?? 10);
  //   if (filter.search) params = params.set('search', filter.search);
  //   if (filter.isActive !== undefined) params = params.set('isActive', filter.isActive);
    
  //   return this.http.get<PagedResult<User>>(this.baseUrl, {
  //     withCredentials: true,
  //   });
  // }

  getPaged() {
    return this.http.get<User[]>(this.baseUrl, {
      withCredentials: true,
    });
  }

  getById(id: string) {
    return this.http.get<User>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  create(user: CreateUserRequest) {
    return this.http.post(this.baseUrl, user, { withCredentials: true });
  }

  update(id: string, user: UpdateUserRequest) {
    return this.http.patch(`${this.baseUrl}/${id}`, user, { withCredentials: true });
  }

  toggleActive(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/toggle-active`, {}, { withCredentials: true });
  }
}
