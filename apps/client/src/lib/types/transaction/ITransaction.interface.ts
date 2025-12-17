import { PaymentMethod, PaymentProvider, PaymentPurpose } from "../payment/payment.interface";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  balanceBefore: number;
  balanceAfter: number;
  metadata?: Record<string, any>;
  purpose: PaymentPurpose;
  paymentMethod: PaymentMethod;
  paymentProvider: PaymentProvider;
  externalTransactionId: string;
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  TRANSFER = 'TRANSFER',
  REFUND = 'REFUND',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
}