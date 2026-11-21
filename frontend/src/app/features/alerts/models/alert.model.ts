export enum AlertType {
  StockMinimo = 1,
  StockAgotado = 2,
  DeudaLimiteCliente = 3,
  CompraPendiente = 4,
}
export interface Alert {
  id: string; 
  type: AlertType;
  message: string;
  isRead: boolean;
  referenceId?: string;
  referenceType?: string;
  createdAt: string;
}