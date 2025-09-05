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
    ValidateIf,
    Validate,
    IsDefined
} from 'class-validator';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { Currency } from 'src/payment/enums/currency.enum';


@ValidatorConstraint({ name: 'AtLeastOnePricingWithPriceAndCurrency', async: false })
class AtLeastOnePricingWithPriceAndCurrency implements ValidatorConstraintInterface {
    validate(pricing: PricingDto, args: ValidationArguments): boolean {
        const obj = args.object as CreateCourseDto;
        if (!obj?.isPaid) return true; // Not required when course is free
        if (!pricing) return false;

        const cycles = [BillingCycle.MONTHLY, BillingCycle.YEARLY, BillingCycle.ONE_TIME];
        return cycles.some((cycle) => {
            const details = pricing?.[cycle];
            return details !== undefined
                && typeof details.price === 'number'
                && !Number.isNaN(details.price)
                && details.currency !== undefined;
        });
    }

    defaultMessage(): string {
        return 'pricing must include at least one of monthly, yearly, or one_time with price and currency when isPaid is true';
    }
}

export class PricingDetailsDto {

    @IsNumber()
    @IsOptional()
    @Min(0)
    price: number;

    @IsEnum(Currency)
    @IsOptional()
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

    @ValidateIf(o => o.isPaid === true)
    @IsDefined({ message: 'pricing is required when isPaid is true' })
    @Validate(AtLeastOnePricingWithPriceAndCurrency)
    @ValidateNested()
    @Type(() => PricingDto)
    pricing: PricingDto;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value !== undefined ? value : false)
    isPaid?: boolean;

    @IsMongoId({ each: true })
    @IsOptional()
    coInstructors?: string[];

    @IsString()
    @IsOptional()
    thumbnailKey: string;

    // @IsString()
    // @IsOptional()
    // trailer?: string;

    @ValidateNested()
    @Type(() => SettingsDto)
    @IsOptional()
    settings?: SettingsDto;


    @IsOptional()
    authorization: string
}
