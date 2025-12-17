import { PaymentMethod } from 'src/payment/types/paymentMethod.interface';
import { Currency } from '../../enums/currency.enum';
import { UserDocument } from 'src/user/entities/user.entity';
import { Course } from 'src/course/entities/course.entity';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { TransactionStatus } from 'aws-sdk/clients/rdsdataservice';

export enum PaymentProvider {
  PAYMOB = 'PAYMOB',
  PAYPAL = 'PAYPAL',
  KASHIER = 'KASHIER',
  STRIPE = 'STRIPE', // Easy to add new providers
}

export enum PaymentPurpose {
  WALLET_CREDIT = 'WALLET_CREDIT',
  SUBSCRIPTION = 'SUBSCRIPTION',
  COURSE_PURCHASE = 'COURSE_PURCHASE',
}

export interface PaymentRequest {
  amount: number;
  currency: Currency;
  user: UserDocument;
  metadata?: Record<string, any>;
  billingData?: BillingData;
  method: PaymentMethod;
  purpose: PaymentPurpose;
  course?: Course;
  billingCycle?:BillingCycle
}

export interface BillingData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country: string;
    countryCode: string;
    postalCode?: string;
  };
}

export interface PaymentResponse {
  paymentUrl: string;
  paymentId: string;
  expiresAt?: Date;
  provider: PaymentProvider;
  metadata?: Record<string, any>;
}

export interface WebhookPayload {
  provider: PaymentProvider;
  rawPayload: any;
  eventType: string;
}

export interface ProcessedWebhook {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus
  metadata: Record<string, any>;
}

/**
 * Main Strategy Interface - All payment providers must implement this
 */
export interface IPaymentStrategy {
  /**
   * Get the provider identifier
   */
  getProvider(): PaymentProvider;

  /**
   * Create a payment URL/link for the user
   */
  createPaymentUrl(request: PaymentRequest): Promise<PaymentResponse>;

  /**
   * Process webhook from payment provider
   */
  processWebhook(payload: WebhookPayload): Promise<ProcessedWebhook>;

  /**
   * Verify webhook authenticity (signature verification)
   */
  verifyWebhook(payload: any, signature?: string): boolean;

  /**
   * Get payment status from provider
   */
  getPaymentStatus(paymentId: string): Promise<ProcessedWebhook>;
}

/**
 * Subscription-specific strategy for providers that support subscriptions
 */
export interface ISubscriptionStrategy extends IPaymentStrategy {
  createSubscriptionPlan(planData: SubscriptionPlanData): Promise<string>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
  updateSubscription(subscriptionId: string, data: any): Promise<boolean>;
}

export interface SubscriptionPlanData {
  name: string;
  description: string;
  amount: number;
  currency: Currency;
  frequency: number; // in days
  trialDays?: number;
}
