import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, ValidateIf, ValidateNested } from 'class-validator';
import { CreatePaymobSubscriptionPlanDto } from 'src/payment/dto/create-subscription-plan.dto';
import {
  customerDto,
  PaymobBillingData,
} from 'src/payment/dto/create-subscription.dto';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { SubscriptionType } from 'src/utils/enums/subscriptionType.enum';

export class CreateEnrollmentDto {}

export class InitiateSubscriptionDto extends CreatePaymobSubscriptionPlanDto {
  @IsEnum(SubscriptionType)
  subscriptionType: SubscriptionType;

  @ValidateIf((o) => o.subscriptionType == SubscriptionType.ORGANIZATION_PLAN)
  @IsMongoId()
  organizationId: string;

  @ValidateIf((o) => o.subscriptionType == SubscriptionType.ORGANIZATION_PLAN)
  @IsMongoId()
  planId: string;

  @ValidateIf((o) => o.subscriptionType == SubscriptionType.USER_COURSE)
  @IsMongoId()
  userId: string;

  @ValidateIf((o) => o.subscriptionType == SubscriptionType.USER_COURSE)
  @IsMongoId()
  courseId: string;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  // @ValidateNested()
  // @Type(() => ExtrasDto)
  // extras: ExtrasDto;

  @ValidateNested()
  @Type(() => customerDto)
  customer: customerDto;

  @ValidateNested()
  @Type(() => PaymobBillingData)
  billing_data: PaymobBillingData;
}
