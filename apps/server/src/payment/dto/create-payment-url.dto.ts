import {
  IsEnum,
  IsNumber,
  IsPositive,
  Min,
  Max,
  IsOptional,
  IsObject,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Currency } from '../enums/currency.enum';
import { PaymentProvider } from '../strategies/interfaces/payment-strategy.interface';
import { PaymentMethodDto } from 'src/payment/dto/create-paypal-subscription.dto';
import { PaymentMethod } from 'src/payment/types/paymentMethod.interface';
import { PaymentPurpose } from 'src/payment/types/PaymentPurpose.interface';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';

export class CreatePaymentUrlDto {
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(1000000)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsEnum(PaymentMethodDto)
  method: PaymentMethod;

  @IsEnum(PaymentPurpose)
  purpose: PaymentPurpose;


  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle

  @IsOptional()
  courseId?: string;
}
