// src/payment/strategies/paypal.strategy.ts

import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';
import {
  IPaymentStrategy,
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  WebhookPayload,
  ProcessedWebhook,
} from './interfaces/payment-strategy.interface';
import { ConfigService } from '@nestjs/config';
import { Currency } from '../enums/currency.enum';

@Injectable()
export class PaypalStrategy implements IPaymentStrategy {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly secret: string;
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor() {}

  getProvider(): PaymentProvider {
    return PaymentProvider.PAYPAL;
  }

  async createPaymentUrl(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const token = await this.getAuthToken();

      // For wallet credit, create a simple order (not subscription)
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: request.currency || Currency.USD,
              value: request.amount.toFixed(2),
            },
            description: `Wallet Credit - ${request.amount} ${request.currency}`,
            custom_id: JSON.stringify({
              userId: request.user._id.toString(),
              purpose: request.purpose,
              ...request.metadata,
            }),
          },
        ],
        application_context: {
          return_url: this.getReturnUrl(),
          cancel_url: this.getCancelUrl(),
          brand_name: 'Your App Name',
          user_action: 'PAY_NOW',
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const approvalUrl = response.data.links.find(
        (link: any) => link.rel === 'approve',
      )?.href;

      if (!approvalUrl) {
        throw new InternalServerErrorException(
          'No approval URL found in PayPal response',
        );
      }

      return {
        paymentUrl: approvalUrl,
        paymentId: response.data.id,
        provider: PaymentProvider.PAYPAL,
        metadata: {
          orderId: response.data.id,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `PayPal payment creation failed: ${error.message}`,
      );
    }
  }

  async processWebhook(payload: WebhookPayload): Promise<ProcessedWebhook> {
    const { event_type, resource } = payload.rawPayload;

    // Handle different PayPal webhook event types
    if (event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const customData = resource.custom_id
        ? JSON.parse(resource.custom_id)
        : {};

      return {
        success: true,
        transactionId: resource.id,
        amount: parseFloat(resource.amount.value),
        currency: resource.amount.currency_code,
        status: 'completed',
        metadata: {
          ...customData,
          payerId: resource.payer?.payer_id,
          email: resource.payer?.email_address,
        },
      };
    }

    if (event_type === 'PAYMENT.CAPTURE.DENIED') {
      return {
        success: false,
        transactionId: resource.id || 'unknown',
        amount: 0,
        currency: Currency.USD,
        status: 'failed',
        metadata: {},
      };
    }

    // Handle other event types...
    return {
      success: false,
      transactionId: 'unknown',
      amount: 0,
      currency: Currency.USD,
      status: 'pending',
      metadata: { event_type },
    };
  }

  verifyWebhook(payload: any, signature?: string): boolean {
    // Implement PayPal webhook signature verification
    // https://developer.paypal.com/api/rest/webhooks/
    // This requires webhook ID and transmission signature verification
    return true;
  }

  async getPaymentStatus(paymentId: string): Promise<ProcessedWebhook> {
    try {
      const token = await this.getAuthToken();
      const response = await axios.get(
        `${this.baseUrl}/v2/checkout/orders/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const order = response.data;
      const status = order.status === 'COMPLETED' ? 'completed' : 'pending';

      return {
        success: order.status === 'COMPLETED',
        transactionId: order.id,
        amount: parseFloat(order.purchase_units[0].amount.value),
        currency: order.purchase_units[0].amount.currency_code,
        status,
        metadata: {
          payerEmail: order.payer?.email_address,
          payerId: order.payer?.payer_id,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch PayPal order status: ${error.message}`,
      );
    }
  }

  private async getAuthToken(): Promise<string> {
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now()) {
      return this.cachedToken.token;
    }

    const response = await axios.post(
      `${this.baseUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: this.clientId,
          password: this.secret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const expiresIn = response.data.expires_in || 3600;
    this.cachedToken = {
      token: response.data.access_token,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    return this.cachedToken.token;
  }

  private getReturnUrl(): string {
    const baseUrl = process.env.APP_BASE_URL;
    return `${baseUrl}/payment/paypal/return`;
  }

  private getCancelUrl(): string {
    const baseUrl = process.env.APP_BASE_URL;
    return `${baseUrl}/payment/paypal/cancel`;
  }
}
