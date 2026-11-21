import { SalePaymentType } from "../../sales/models/sale.model";


//Requests
export interface CreateCreditPaymentRequest {
    customerId: string;
    amount: number;
    paymentType: SalePaymentType;
    notes?: string;
}

export interface CancelCreditPaymentRequest {
    reason: string;
}

//Response
export interface CreditPaymentResponse {
    id: string;
    date: string;
    amount: number;
    paymentType: SalePaymentType;
    notes: string | null;
    isCancelled: boolean;
    cancelledAt: string | null;
    cancellationReason: string | null;
    customerId: string;
    customerFullName: string;
    userId: string;
    userFullName: string;
    cashRegisterId: string;
    createdAt: string;
}