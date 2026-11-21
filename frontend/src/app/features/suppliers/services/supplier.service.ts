import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PagedResultWithStatus } from '../../../shared/models/paged-result.model';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../models/supplier.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/suppliers`;

    getPaged(filter: {page?: number, pageSize?: number, search?:string, isActive?:boolean} = {}) {
        let params = new HttpParams()
            .set('page', filter.page ?? 1)
            .set('pageSize', filter.pageSize ?? 10);
        if (filter.search) params = params.set('search', filter.search);
        if (filter.isActive !== undefined) params = params.set('isActive', filter.isActive);
        return this.http.get<PagedResultWithStatus<Supplier>>(this.baseUrl, {
            params,
            withCredentials: true,
        });
    }

    getById(id: string) {
        return this.http.get<Supplier>(`${this.baseUrl}/${id}`, { withCredentials: true });
    }

    create(supplier: CreateSupplierRequest) {
        return this.http.post(this.baseUrl, supplier, { withCredentials: true });
    }

    update(id: string, supplier: UpdateSupplierRequest) {
        return this.http.patch(`${this.baseUrl}/${id}`, supplier, { withCredentials: true });
    }

    toggleActive(id: string) {
        return this.http.patch(`${this.baseUrl}/${id}/toggle-active`, {}, { withCredentials: true });
    }
}