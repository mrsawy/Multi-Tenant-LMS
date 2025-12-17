import { v4 } from 'uuid';
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  IPaymentStrategy,
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  WebhookPayload,
  ProcessedWebhook,
  PaymentPurpose,
} from './interfaces/payment-strategy.interface';

@Injectable()
export class KashierStrategy implements IPaymentStrategy {
  private readonly baseUrl: string;
  private readonly merchantId: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor() {
    this.baseUrl = process.env.KASHIER_BASE_URL;
    this.merchantId = process.env.KASHIER_MERCHANT_ACCOUNT_ID;
    this.apiKey = process.env.KASHIER_PAYMENT_API_KEY;
    this.secretKey = process.env.KASHIER_SECRET_KEY;
  }

  getProvider(): PaymentProvider {
    return PaymentProvider.KASHIER;
  }
  async createPaymentUrl(request: PaymentRequest): Promise<PaymentResponse> {
    const orderId = this.generateOrderId();

    //Create your Order
    let order: any = {
      amount: 600,
      currency: 'EGP',
      merchantOrderId: Date.now(),
      mid: this.merchantId,
      secret: this.apiKey,
      baseUrl: process.env.SECURED_BASE_URL,
      //order meta data JSON String
      metaData: JSON.stringify({
        'Customer Name': 'Mohamed Khaled',
        'Cutomer Phone': '+20100XXX',
        'Cutomer Email': 'mkhalid@kashier.io',
      }),
      merchantRedirect: this.getRedirectUrl(),
      failureRedirect: this.getRedirectUrl(),
      serverWebhook: this.getWebhookUrl(),
      display: 'ar',
      redirectMethod: 'get',

      //Add the following options separated by comma remove or leave empty for all allowed methods.
      //,allowedMethods:"card,wallet,bank_installments"
      //   allowedMethods: 'bank_installments,card',
      // Add the following your brand color by passing hexadecimal color as brandColor= encodeURIComponent("#A30000"),
      // Also you can set opacity by setting rgba as brandColor= encodeURIComponent("rgba(163, 0, 0, 1)")
      // By default the branding color is rgba(45, 164, 78, 0.9)
      brandColor: 'rgba(163, 0, 0, 1)',
      type: 'external',
    };

    order.hash = this.generateKashierOrderHash(order);

    let hppUrl =
      `${this.baseUrl}?` +
      `merchantId=${order.mid}` +
      `&orderId=${order.merchantOrderId}` +
      `&amount=${order.amount}` +
      `&secret=${order.secret}` +
      `&currency=${order.currency}` +
      `&hash=${order.hash}` +
      `&merchantRedirect=${order.merchantRedirect}` +
      `&metaData=${order.metaData ? order.metaData : ''}` +
      `&failureRedirect=${order.failureRedirect ? order.failureRedirect : ''}` +
      `&redirectMethod=${order.redirectMethod ? order.redirectMethod : ''}` +
      `&display=${order.display ? order.display : ''}` +
      `&type =${order.type ? order.type : ''}` +
    //   `&brandColor=${encodeURIComponent(order.brandColor)}` +
      `&mode=${process.env.KASHIER_MODE || 'test'}`;

    try {
      //   // ⭐ Axios GET (valid)
      //   const response = await axios.get(checkoutUrl, {
      //     headers: {
      //       Authorization: `Bearer ${this.apiKey}`,
      //     },
      //   });

      // Kashier always returns the same redirect URL you already built
      return {
        paymentUrl: hppUrl,
        paymentId: orderId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        provider: PaymentProvider.KASHIER,
        metadata: { orderId, merchantId: this.merchantId },
      };
    } catch (error) {
      console.error('Kashier Error', error?.response?.data || error);
      throw new BadRequestException(
        'Failed to create Kashier payment: ' + error.message,
      );
    }
  }

  async processWebhook(payload: WebhookPayload): Promise<ProcessedWebhook> {
    const data = payload.rawPayload;

    // Verify webhook signature
    if (!this.verifyWebhook(data, data.signature)) {
      return {
        success: false,
        transactionId: data.order_id || 'unknown',
        amount: 0,
        currency: data.currency || 'EGP',
        status: 'failed',
        metadata: {
          error: 'Invalid webhook signature',
        },
      };
    }

    const isSuccessful =
      data.status === 'SUCCESS' ||
      data.status === 'success' ||
      data.response?.status === 'SUCCESS';

    if (!isSuccessful) {
      return {
        success: false,
        transactionId: data.order_id || data.transaction_id,
        amount: Number(data.amount) / 100 || 0,
        currency: data.currency || 'EGP',
        status: 'failed',
        metadata: {
          response: data.response,
          message: data.message,
        },
      };
    }

    const customData = data.custom ? JSON.parse(data.custom) : {};

    return {
      success: true,
      transactionId: data.transaction_id || data.order_id,
      amount: Number(data.amount) / 100,
      currency: data.currency || 'EGP',
      status: 'completed',
      metadata: {
        orderId: data.order_id,
        paymentMethod: data.payment_method,
        cardBrand: data.card_brand,
        cardLast4: data.card_last_four,
        transactionDate: data.transaction_date,
        ...customData,
      },
    };
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    if (!signature) {
      return false;
    }

    try {
      // Kashier webhook verification
      // Create hash from order_id, amount, currency, and secret key
      const dataString = `${payload.order_id}${payload.amount}${payload.currency}${this.secretKey}`;
      const calculatedHash = crypto
        .createHash('sha256')
        .update(dataString)
        .digest('hex');

      return calculatedHash === signature;
    } catch (error) {
      console.error('Webhook verification error:', error);
      return false;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<ProcessedWebhook> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/transactions/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const transaction = response.data.response;
      const isSuccessful = transaction.status === 'SUCCESS';

      return {
        success: isSuccessful,
        transactionId: transaction.transaction_id || paymentId,
        amount: Number(transaction.amount) / 100,
        currency: transaction.currency || 'EGP',
        status: isSuccessful ? 'completed' : 'failed',
        metadata: {
          orderId: transaction.order_id,
          paymentMethod: transaction.payment_method,
          cardBrand: transaction.card_brand,
          transactionDate: transaction.transaction_date,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch Kashier payment status: ${error.message}`,
      );
    }
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
  }

  private createPaymentHash(
    orderId: string,
    amount: number,
    currency: string,
  ): string {
    // Kashier hash format: merchant_id + order_id + amount + currency + secret_key
    const dataString = `${this.merchantId}${orderId}${amount}${currency}${this.secretKey}`;
    return crypto.createHash('sha256').update(dataString).digest('hex');
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
    return `${process.env.SECURED_BASE_URL}/payment/webhook/kashier`;
  }

  private getRedirectUrl(): string {
    return `${process.env.SECURED_BASE_URL}/payment/success`;
  }

  // Copy and paste this code into your backend

  private generateKashierOrderHash(order) {
    const mid = 'MID-123-123'; // Your merchant ID
    const CustomerReference = '1'; // Your customer ID for saving the card
    const amount = order.amount; // e.g., 22.00
    const currency = order.currency; // e.g., "EGP"
    const orderId = order.merchantOrderId; // e.g., 99
    const secret = process.env.KASHIER_PAYMENT_API_KEY;
    const path = `/?payment=${mid}.${orderId}.${amount}.${currency}${CustomerReference ? '.' + CustomerReference : ''}`;

    const hash = crypto.createHmac('sha256', secret).update(path).digest('hex');
    return hash;
  }
  // The result hash for /?payment=mid-0-1.99.20.EGP with secret 11111
  // should be 606a8a1307d64caf4e2e9bb724738f115a8972c27eccb2a8acd9194c357e4bec
}
