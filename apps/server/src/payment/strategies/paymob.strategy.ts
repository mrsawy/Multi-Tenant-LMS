import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import {
  IPaymentStrategy,
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  WebhookPayload,
  ProcessedWebhook,
  PaymentPurpose,
} from './interfaces/payment-strategy.interface';
import { URLS } from 'src/utils/constants';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { TransactionStatus } from 'src/transaction/entities/transaction.entity';
import { PaymobWebhookTransaction } from '../types/transaction.interface';
import { Currency } from '../enums/currency.enum';

@Injectable()
export class PaymobStrategy implements IPaymentStrategy {
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor() { }

  getProvider(): PaymentProvider {
    return PaymentProvider.PAYMOB;
  }

  async createPaymentUrl(request: PaymentRequest): Promise<PaymentResponse> {
    // const token = await this.getAuthToken();

    const requestBody = {
      amount: request.amount * 100,
      currency: request.currency,
      payment_methods: ['creditcard', 'paywallet'],
      items: [
        {
          name: PaymentPurpose.WALLET_CREDIT == request.purpose ? 'Wallet Credit' : request.course?.name || 'Course',
          amount: request.amount * 100,
          description: PaymentPurpose.WALLET_CREDIT == request.purpose ? 'Increasing your wallet balance' : request.course?.description || 'Course',
          quantity: 1,
        },
      ],
      billing_data: {
        ...request.billingData,
        first_name: request.billingData?.firstName,
        last_name: request.billingData?.lastName,
        phone_number: request.billingData?.phone,
      },
      customer: {
        first_name: request.user.firstName,
        last_name: request.user.lastName,
        email: request.user.email,
        extras: {
          userId: request.user._id.toString(),
          courseId: request.course?._id.toString() || request.metadata?.courseId,
          billingCycle: request.billingCycle,
        },
      },
      extras: {
        userId: request.user._id.toString(),
        courseId: request.course?._id.toString() || request.metadata?.courseId,
        billingCycle: request.billingCycle,
        provider: PaymentProvider.PAYMOB,
        purpose: request.purpose,
      },
      notification_url: URLS.paymentWebhookPage,
      redirection_url:
        request.purpose == PaymentPurpose.COURSE_PURCHASE ? URLS.enrollmentsPage : URLS.walletPage,
    };
    console.log({ URLS })

    const response = await axios.post(`${process.env.PAYMOB_BASEURL}/v1/intention/`, requestBody, {
      headers: {
        Authorization: 'Token ' + process.env.PAYMOB_SECRET_KEY,
        'Content-Type': 'application/json',
      },
    });
    const result = response.data;

    return {
      paymentUrl: `${process.env.PAYMOB_BASEURL}/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${result.client_secret}`,
      paymentId: response.data.id,
      // expiresAt: new Date(response.data.expires_at),
      provider: PaymentProvider.PAYMOB,
    };
  }

  async processWebhook(payload: WebhookPayload): Promise<ProcessedWebhook> {
    const { obj } = payload.rawPayload as PaymobWebhookTransaction;

    if (obj && !obj.success) {
      return {
        success: false,
        transactionId: obj.id.toString(),
        amount: 0,
        currency: (obj?.currency as Currency) || Currency.EGP,
        status: TransactionStatus.FAILED,
        metadata: {},
      };
    }

    return {
      success: true,
      transactionId: obj.id.toString(),
      amount: Number(obj.amount_cents) / 100,
      currency: (obj.payment_key_claims?.currency as Currency) || Currency.EGP,
      status: TransactionStatus.COMPLETED,
      metadata: {
        userId: obj.payment_key_claims?.extra?.userId,
        courseId: obj.payment_key_claims?.extra?.courseId,
        billingCycle: obj.payment_key_claims?.extra?.billingCycle,
        purpose: obj.payment_key_claims?.extra?.purpose,
        email: obj.payment_key_claims?.billing_data?.email,
        billingData: obj.billing_data,
      },
    };
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    // Implement Paymob webhook signature verification
    // This is a simplified version - implement actual verification
    return true;
  }

  async getPaymentStatus(paymentId: string): Promise<ProcessedWebhook> {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `${process.env.PAYPAL_BASE_URL}/api/acceptance/transactions/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const transaction = response.data;

      return {
        success: transaction.success,
        transactionId: transaction.id,
        amount: transaction.amount_cents / 100,
        currency: transaction.currency,
        status: transaction.success ? 'completed' : 'failed',
        metadata: {
          billingData: transaction.billing_data,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch payment status: ${error.message}`);
    }
  }

  private async getAuthToken(): Promise<string> {
    // Token caching to avoid repeated auth calls
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.token;
    }

    const response = await axios.post(`${process.env.PAYMOB_BASEURL}/api/auth/tokens`, {
      api_key: process.env.PAYMOB_API_KEY,
    });

    this.cachedToken = {
      token: response.data.token,
      expiresAt: Date.now() + 3600000, // 1 hour
    };

    return this.cachedToken.token;
  }

  private getDescription(purpose: PaymentPurpose): string {
    const descriptions = {
      [PaymentPurpose.WALLET_CREDIT]: 'Wallet Credit',
      [PaymentPurpose.SUBSCRIPTION]: 'Subscription Payment',
      [PaymentPurpose.COURSE_PURCHASE]: 'Course Purchase',
    };
    return descriptions[purpose] || 'Payment';
  }

  private getWebhookUrl(): string {
    return `${process.env.SECURED_BASE_URL}/payment/webhook/paymob`;
  }

  private getRedirectUrl(): string {
    // return `${process.env.SECURED_BASE_URL}`;
    return 'https://translate.google.com/';
  }
}
