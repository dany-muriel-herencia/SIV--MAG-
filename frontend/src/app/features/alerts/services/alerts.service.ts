import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Alert, AlertType } from './../models/alert.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/alerts`;

  getUnread() {
    return this.http.get<Alert[]>(`${this.baseUrl}/unread`, {
      // No muestra el spinner global para este polling
      headers: { 'X-Skip-Loading': 'true' },
    });
  }

  getPaged(
    filter: {
      page?: number;
      pageSize?: number;
      type?: AlertType;
      isRead?: boolean;
    } = {},
  ) {
    let params = new HttpParams()
      .set('page', filter.page ?? 1)
      .set('pageSize', filter.pageSize ?? 10);

    if (filter.type !== undefined && filter.type !== null) {
      params = params.set('type', filter.type);
    }

    if (filter.isRead !== undefined && filter.isRead !== null) {
      params = params.set('isRead', filter.isRead);
    }

    return this.http.get<PagedResult<Alert>>(`${this.baseUrl}`, { params });
  }

  markAsRead(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/read`, {});
  }

  markAsUnread(id: string) {
    return this.http.patch(`${this.baseUrl}/${id}/unread`, {});
  }

  markAllAsRead() {
    return this.http.patch(`${this.baseUrl}/read-all`, {});
  }
}
