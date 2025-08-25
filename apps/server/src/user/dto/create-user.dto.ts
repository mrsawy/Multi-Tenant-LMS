import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional, IsObject, IsEnum, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from 'src/user/enum/status.enum';
import mongoose from 'mongoose';
import { Currency } from 'src/payment/enums/currency.enum';

export class AddressDto {
    @IsOptional()
    @IsString()
    detailedAddress?: string; // override field when needed

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    zipCode?: string;

    @IsOptional()
    @IsString()
    country?: string;
}

export class SocialLinksDto {
    @IsOptional()
    @IsString()
    linkedin?: string;

    @IsOptional()
    @IsString()
    twitter?: string;
}

export class ProfileDto {

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    dateOfBirth?: Date;

    @IsOptional()
    @IsObject()
    @Type(() => AddressDto)
    address?: AddressDto;

    @IsOptional()
    @IsObject()
    @Type(() => SocialLinksDto)
    socialLinks?: SocialLinksDto;
}

export class PreferencesDto {
    @IsOptional()
    @IsString()
    language?: string;

    @IsOptional()
    @IsBoolean()
    emailNotifications?: boolean;

    @IsOptional()
    @IsBoolean()
    darkMode?: boolean;
}

export class CreateUserDto {


    @IsMongoId()
    @IsOptional()
    _id: mongoose.Types.ObjectId

    @IsNotEmpty()
    @IsString()
    username: string

    // @IsOptional()
    // organization: object

    @IsMongoId()
    @IsOptional()
    walletId: mongoose.Types.ObjectId

    @IsOptional()
    @IsString()
    role: string

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsNumber()
    phone: number;


    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    firstName?: string;

    @IsNotEmpty()
    @IsString()
    lastName?: string;

    // @IsOptional()
    @IsObject()
    @Type(() => ProfileDto)
    profile?: ProfileDto;

    @IsOptional()
    @IsObject()
    @Type(() => PreferencesDto)
    preferences?: PreferencesDto;

    @IsEnum(Currency)
    preferredCurrency: Currency
}