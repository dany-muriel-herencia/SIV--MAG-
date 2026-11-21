export interface Customer {
  id: string;
  fullName: string;
  phone?: string;
  address?: string;
  creditLimit: number;
  currentDebt: number;
  availableCredit?: number;
  hasDebt: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCustomerRequest {
    fullName: string;
    phone?: string;
    address?: string;
    creditLimit: number;
}

export interface UpdateCustomerRequest {
    fullName: string;
    phone?: string;
    address?: string;
    creditLimit: number;
}

export interface CustomerPaymentResponse {
    id: string;
    date: string;
    amount: number;
    notes?: string;
    userId: string;
    userFullName: string;
}