import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  CustomerDebtReportDto,
  DashboardData,
  SalesSummary,
  StockValuationDto,
  TopProduct,
} from '../models/report.model';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  getDashboardData() {
    return this.http.get<DashboardData>(`${this.baseUrl}/dashboard`);
  }

  getSalesSummary(from: string, to: string) {
    return this.http.get<SalesSummary>(`${this.baseUrl}/sales`, {
      params: { from, to },
    });
  }

  getTopProducts(from: string, to: string, limit = 5) {
    const params = new HttpParams().set('from', from).set('to', to).set('limit', limit.toString());

    return this.http.get<TopProduct[]>(`${this.baseUrl}/top-products`, { params });
  }

  getStockValuation() {
    return this.http.get<StockValuationDto>(`${this.baseUrl}/stock-valuation`, {});
  }

  getCustomerDebtReport() {
    return this.http.get<CustomerDebtReportDto>(`${this.baseUrl}/customer-debt`, {});
  }
}
