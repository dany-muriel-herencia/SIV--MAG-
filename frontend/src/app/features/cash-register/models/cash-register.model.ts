export interface CashRegisterResponse {
  id: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  closingBalance?: number;
  expectedBalance?: number;
  difference: number;
  isOpen: boolean;
  openingNotes?: string;
  closingNotes?: string;
  userId: string;
  userFullName: string;
  summary?: CashRegisterSummaryResponse;
  createdAt: string;
  updatedAt?: string;
}

export interface CashRegisterSummaryResponse {
  totalSales: number;
  cancelledSales: number;
  totalCash: number;
  totalCard: number;
  totalTransfer: number;
  totalCreditIssued: number;
  totalCreditCollected: number;
  totalRevenue: number;
}

export interface OpenCashRegisterRequest {
  openingBalance: number;
  openingNotes?: string;
}

export interface CloseCashRegisterRequest {
  closingBalance: number;
  closingNotes?: string;
}
