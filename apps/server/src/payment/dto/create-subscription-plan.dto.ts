import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymobSubscriptionItem {
  @IsString()
  name: string;

  @IsInt()
  amount: number;

  @IsString()
  description: string;
}

export class CreatePaymobSubscriptionPlanDto {
  @IsString()
  @IsOptional()
  token: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  reminder_days?: number | null;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  plan_type: 'rent'; // only 'rent' is supported for now

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  number_of_deductions?: number | null;

  @IsInt()
  @Type(() => Number)
  frequency: number; // e.g. 7, 15, 30, 90, 180, 365

  @IsBoolean()
  use_transaction_amount: boolean = true;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  // @ValidateNested({ each: true })
  // @Type(() => PaymobSubscriptionItem)
  // items: PaymobSubscriptionItem[];
}
