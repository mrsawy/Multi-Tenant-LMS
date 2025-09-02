import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsMongoId,
    ValidateNested,
    IsEnum,
    IsNumber,
    IsBoolean,
    IsDate,
    Min,
    Max,
    ValidateIf
} from 'class-validator';
import { Type } from 'class-transformer';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { Currency } from 'src/payment/enums/currency.enum';


export class PricingDetailsDto {

    @IsNumber()
    @Min(0)
    price: number;

    @IsEnum(Currency)
    currency: Currency;
    
    @IsDate()
    @IsOptional()
    discountEndDate?: Date;

    @IsDate()
    @IsOptional()
    discountStartDate?: Date;

    @IsNumber()
    @IsOptional()
    @Min(0)
    @Max(100)
    discountPercentage?: number;
}
export class PricingDto {
    @ValidateNested()
    @Type(() => PricingDetailsDto)
    @IsOptional()
    [BillingCycle.MONTHLY]?: PricingDetailsDto;

    @ValidateNested()
    @Type(() => PricingDetailsDto)
    @IsOptional()
    [BillingCycle.YEARLY]?: PricingDetailsDto;

    @ValidateNested()
    @Type(() => PricingDetailsDto)
    @IsOptional()
    [BillingCycle.ONE_TIME]?: PricingDetailsDto;
}

export class SettingsDto {
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @IsBoolean()
    @IsOptional()
    isDraft?: boolean;

    @IsNumber()
    @IsOptional()
    enrollmentLimit?: number;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    enrollmentDeadline?: Date;

    @IsBoolean()
    @IsOptional()
    certificateEnabled?: boolean;

    @IsBoolean()
    @IsOptional()
    discussionEnabled?: boolean;

    @IsBoolean()
    @IsOptional()
    downloadEnabled?: boolean;
}

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    shortDescription?: string;

    @IsMongoId({ each: true })
    @IsOptional()
    categories?: string[];

    @IsMongoId({ each: true })
    @IsOptional()
    modulesIds?: string[];

    @IsMongoId()
    @IsOptional()
    instructor?: string;

    @ValidateNested()
    @Type(() => PricingDto)
    @ValidateIf(o =>
        o.pricing?.[BillingCycle.MONTHLY] ||
        o.pricing?.[BillingCycle.YEARLY] ||
        o.pricing?.[BillingCycle.ONE_TIME]
    )
    pricing: PricingDto;

    @IsBoolean()
    @IsNotEmpty()
    isPaid: boolean

    @IsMongoId({ each: true })
    @IsOptional()
    coInstructors?: string[];

    @IsString()
    @IsOptional()
    thumbnail?: string;

    // @IsString()
    // @IsOptional()
    // trailer?: string;

    @ValidateNested()
    @Type(() => SettingsDto)
    @IsOptional()
    settings?: SettingsDto;
}
