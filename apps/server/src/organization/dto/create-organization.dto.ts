import { IsBoolean, IsEnum, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";


import { Plans } from "../enums/plans.enums";
import { Type } from "class-transformer";

export class SubscriptionDto {
    @IsString()
    planId: string;

    @IsEnum(['active', 'expired', 'cancelled'])
    status: string;

    @IsISO8601()
    startDate: string;

    @IsISO8601()
    endDate: string;

    @IsString()
    stripeCustomerId: string;
}

export class BrandingDto {
    @IsUrl()
    logo: string;

    @IsString()
    primaryColor: string;

    @IsString()
    secondaryColor: string;
}

export class FeaturesDto {
    @IsInt()
    maxUsers: number;

    @IsInt()
    maxCourses: number;

    @IsBoolean()
    certificatesEnabled: boolean;

    @IsBoolean()
    advancedAnalytics: boolean;
}

export class NotificationsDto {
    @IsBoolean()
    emailEnabled: boolean;

    @IsBoolean()
    smsEnabled: boolean;
}

export class SettingsDto {
    @ValidateNested()
    @Type(() => BrandingDto)
    branding: BrandingDto;

    @ValidateNested()
    @Type(() => FeaturesDto)
    features: FeaturesDto;

    @ValidateNested()
    @Type(() => NotificationsDto)
    notifications: NotificationsDto;
}

export class CreateOrganizationDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsOptional()
    @IsString()
    domain?: string;

    @IsEnum(Plans)
    plan: Plans;

    @ValidateNested()
    @Type(() => SubscriptionDto)
    subscription: SubscriptionDto;

    @ValidateNested()
    @Type(() => SettingsDto)
    settings: SettingsDto;
}
