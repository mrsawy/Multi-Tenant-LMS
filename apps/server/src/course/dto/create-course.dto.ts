import { IsString, IsNotEmpty, IsOptional, IsMongoId, ValidateNested, IsEnum, IsNumber, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { PricingType } from '../enum/pricingType.enum';

export class PricingDto {
    @IsEnum(PricingType)
    @IsNotEmpty()
    type: PricingType;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsNumber()
    @IsOptional()
    discountPrice?: number;

    @IsDate()
    @IsOptional()
    @Type(() => Date)
    discountEndDate?: Date;
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
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    shortDescription?: string;

    @IsMongoId({ each: true })
    @IsOptional()
    categories?: string[];

    @IsMongoId()
    @IsOptional()
    instructor?: string;

    @IsMongoId({ each: true })
    @IsOptional()
    coInstructors?: string[];

    @IsString()
    @IsOptional()
    thumbnail?: string;

    @IsString()
    @IsOptional()
    trailer?: string;

    @ValidateNested()
    @Type(() => PricingDto)
    @IsNotEmpty()
    pricing: PricingDto;

    @ValidateNested()
    @Type(() => SettingsDto)
    @IsOptional()
    settings?: SettingsDto;
}