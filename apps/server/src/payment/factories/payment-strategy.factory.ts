import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentStrategy,
  PaymentProvider,
} from '../strategies/interfaces/payment-strategy.interface';
import { PaymobStrategy } from '../strategies/paymob.strategy';
import { PaypalStrategy } from '../strategies/paypal.strategy';

/**
 * Factory pattern for creating payment strategies
 * Alternative approach to dependency injection registration
 */
@Injectable()
export class PaymentStrategyFactory {
  constructor() {}

  createStrategy(provider: PaymentProvider): IPaymentStrategy {
    switch (provider) {
      case PaymentProvider.PAYMOB:
        return new PaymobStrategy();

      case PaymentProvider.PAYPAL:
        return new PaypalStrategy();

      // Easy to add new providers
      case PaymentProvider.STRIPE:
        // return new StripeStrategy(this.configService);
        throw new BadRequestException('Stripe not yet implemented');

      default:
        throw new BadRequestException(
          `Payment provider ${provider} is not supported`,
        );
    }
  }

  /**
   * Get all available strategies
   */
  getAllStrategies(): IPaymentStrategy[] {
    return [new PaymobStrategy(), new PaypalStrategy()];
  }
}
