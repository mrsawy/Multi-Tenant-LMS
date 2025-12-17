// lib/types/payment/payment.interface.ts

export enum PaymentProvider {
  PAYMOB = 'PAYMOB',
  PAYPAL = 'PAYPAL',
  KASHIER = 'KASHIER',
}

export enum PaymentMethod {
  WALLET = 'WALLET',
  DIRECT = 'DIRECT',
  MOBILE_WALLET = 'MOBILE_WALLET',
  CHECK = 'CHECK',
  OTHER = 'OTHER',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
}

export enum PaymentPurpose {
  WALLET_CREDIT = 'WALLET_CREDIT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  COURSE_PURCHASE = 'COURSE_PURCHASE',
}

export interface PaymentOption {
  id: string; // Unique identifier for the option
  provider: PaymentProvider;
  method: PaymentMethod;
  name: string;
  description: string;
  icon: any; // Lucide icon component
  logo: string; // Emoji or image
  currencies: string[];
  integrationId?: string; // For Paymob different integration IDs
}

export interface CreatePaymentLinkRequest {
  amount: number;
  currency: string;
  provider: PaymentProvider;
  method: PaymentMethod;
  purpose: PaymentPurpose;
  metadata?: Record<string, any>;
}

export interface CreatePaymentLinkResponse {
  paymentUrl: string;
  paymentId: string;
  expiresAt?: string;
  provider: string;
  method: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'pending';
  metadata?: Record<string, any>;
}

export interface CreatePaymentLinkRequest {
  amount: number;
  currency: string;
  provider: PaymentProvider;
  metadata?: Record<string, any>;
  purpose: PaymentPurpose;
}

export interface CreatePaymentLinkResponse {
  paymentUrl: string;
  paymentId: string;
  expiresAt?: string;
  provider: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'pending';
}

export enum PaymentMethods {
  MOBILE_WALLET = 'MOBILE_WALLET',
  CREDIT_CARD = 'CREDIT_CARD',
}
