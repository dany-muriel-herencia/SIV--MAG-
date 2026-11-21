import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CashRegisterResponse,
  CloseCashRegisterRequest,
  OpenCashRegisterRequest,
} from '../models/cash-register.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class CashRegisterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/cashregisters`;

  getPaged(
    filters: {
      page?: number;
      pageSize?: number;
      userId?: string;
      from?: string;
      to?: string;
      isOpen?: boolean;
    } = {},
  ) {
    let params = new HttpParams()
      .set('page', filters.page ?? 1)
      .set('pageSize', filters.pageSize ?? 10);

    if (filters.userId?.trim()) {
      params = params.set('userId', filters.userId.trim());
    }
    if (filters.from) {
      params = params.set('from', filters.from);
    }
    if (filters.to) {
      params = params.set('to', filters.to);
    }
    if (filters.isOpen !== undefined && filters.isOpen !== null) {
      params = params.set('isOpen', filters.isOpen);
    }

    return this.http.get<PagedResult<CashRegisterResponse>>(this.baseUrl, { params });
  }

  getById(id: string) {
    return this.http.get<CashRegisterResponse>(`${this.baseUrl}/${id}`);
  }

  open(cashRegister: OpenCashRegisterRequest) {
    return this.http.post<CashRegisterResponse>(`${this.baseUrl}/open`, cashRegister);
  }

  close(id: string, cashRegister: CloseCashRegisterRequest) {
    return this.http.patch<CashRegisterResponse>(`${this.baseUrl}/${id}/close`, cashRegister);
  }

  getCurrent() {
    return this.http.get<CashRegisterResponse | null>(`${this.baseUrl}/current`).pipe(
      catchError((err) => {
        if (err.status === 404) {
          return of(null);
        }
        return throwError(() => err);
      })
    );
  }
}