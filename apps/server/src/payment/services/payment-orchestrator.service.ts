import {
  Injectable,
  BadRequestException,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';
import {
  IPaymentStrategy,
  PaymentProvider,
  PaymentRequest,
  PaymentResponse,
  ProcessedWebhook,
  PaymentPurpose,
} from '../strategies/interfaces/payment-strategy.interface';
import { User, UserDocument } from 'src/user/entities/user.entity';
import { Currency } from '../enums/currency.enum';
import { CreatePaymentUrlDto } from '../dto/create-payment-url.dto';
import { PaymentMethod } from '../types/paymentMethod.interface';
import { Course } from 'src/course/entities/course.entity';

@Injectable()
export class PaymentOrchestratorService {
  private strategies: Map<PaymentProvider, IPaymentStrategy> = new Map();

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) { }

  registerStrategy(strategy: IPaymentStrategy): void {
    this.strategies.set(strategy.getProvider(), strategy);
  }

  private getStrategy(provider: PaymentProvider): IPaymentStrategy {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new BadRequestException(
        `Payment provider ${provider} is not supported`,
      );
    }
    return strategy;
  }

  async createPaymentUrl({
    provider,
    amount,
    currency,
    user,
    purpose = PaymentPurpose.WALLET_CREDIT,
    method,
    course, billingCycle,
    metadata: dtoMetadata,
    courseId
  }: CreatePaymentUrlDto & { user: UserDocument, course?: Course }): Promise<PaymentResponse> {
    const strategy = this.getStrategy(provider);

    const request: PaymentRequest = {
      amount,
      currency,
      purpose,
      user,
      method,
      course,
      billingCycle,
      metadata: {
        ...dtoMetadata,
        walletId: user.walletId?.toString(),
        courseId: course?._id.toString() || courseId,
      },
      billingData: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: {
          country: 'EG',
          countryCode: 'EG',
        },
      },
    };

    return await strategy.createPaymentUrl(request);
  }

  async processWalletCreditWebhook(
    provider: PaymentProvider,
    webhookPayload: any,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const strategy = this.getStrategy(provider);

    if (!strategy.verifyWebhook(webhookPayload)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const processed = await strategy.processWebhook({
      provider,
      rawPayload: webhookPayload,
      eventType: webhookPayload.event_type || webhookPayload.type,
    });

    if (!processed.success) {
      return {
        success: false,
        message: 'Payment was not successful',
      };
    }

    // Here we need to credit the wallet
    // Import WalletService dynamically or use a different approach
    const { WalletService } = await import('src/wallet/wallet.service');

    // This will be handled by the webhook which has access to the container
    return {
      success: true,
      message: 'Webhook processed successfully',
      data: processed,
    };
  }

  async getPaymentStatus(
    provider: PaymentProvider,
    paymentId: string,
  ): Promise<ProcessedWebhook> {
    const strategy = this.getStrategy(provider);
    return await strategy.getPaymentStatus(paymentId);
  }

  getAvailableProviders(): PaymentProvider[] {
    return Array.from(this.strategies.keys());
  }

  async processWebhook(provider: PaymentProvider, payload: any) {
    const strategy = this.getStrategy(provider);
    return strategy.processWebhook(
      {
        provider,
        rawPayload: payload,
        eventType: payload.type
      }
    )
  }
}
