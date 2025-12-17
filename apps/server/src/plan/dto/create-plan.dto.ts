import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { PlanTier } from '../enum/planTier.enum';

class PriceDto {
  @IsNumber()
  @Min(0)
  [BillingCycle.MONTHLY]: number;

  @IsNumber()
  @Min(0)
  [BillingCycle.YEARLY]: number;

  @IsNumber()
  @Min(0)
  [BillingCycle.ONE_TIME]: number;
}

class FeaturesDto {
  @IsNumber()
  @Min(0)
  maxUsers: number;

  @IsNumber()
  @Min(0)
  maxCourses: number;

  @IsNumber()
  @Min(0)
  maxStorageGB: number;

  @IsBoolean()
  analytics: boolean;

  @IsBoolean()
  prioritySupport: boolean;
}

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;

  @ValidateNested()
  @Type(() => FeaturesDto)
  features: FeaturesDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsEnum(PlanTier)
  @IsNotEmpty()
  tier: PlanTier;

  @IsString()
  @IsOptional()
  paypalPlanId: string;
}
