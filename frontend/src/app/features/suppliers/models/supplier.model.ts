export interface Supplier {
  id: string;
  name: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface CreateSupplierRequest {
  name: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}