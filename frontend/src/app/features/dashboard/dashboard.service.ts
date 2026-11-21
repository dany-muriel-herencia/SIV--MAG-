import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { DashboardData, TopProduct } from '../reports/models/report.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  getDashboardData() {
    return this.http.get<DashboardData>(`${this.baseUrl}/dashboard`, { withCredentials: true });
  }

  getTopProducts(from: Date, to: Date, limit: number = 5): Observable<TopProduct[]> {
    const params = new HttpParams()
      .set('from', from.toISOString())
      .set('to', to.toISOString())
      .set('limit', limit.toString());

    return this.http.get<TopProduct[]>(`${this.baseUrl}/top-products`, { params });
  }
}
