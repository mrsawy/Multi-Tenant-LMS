import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsOptional, IsObject, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from 'src/user/enum/status.enum';

class AddressDto {
    @IsOptional()
    @IsString()
    street?: string;

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

class SocialLinksDto {
    @IsOptional()
    @IsString()
    linkedin?: string;

    @IsOptional()
    @IsString()
    twitter?: string;
}

class ProfileDto {
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

class PreferencesDto {
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

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    organizationId: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;


    @IsNumber()
    phone: number;


    @IsNotEmpty()
    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;


    // @IsNotEmpty()
    // @IsString()
    // roleId: string;

    @IsOptional()
    @IsObject()
    @Type(() => ProfileDto)
    profile?: ProfileDto;

    @IsOptional()
    @IsObject()
    @Type(() => PreferencesDto)
    preferences?: PreferencesDto;

    @IsOptional()
    @IsEnum(Status)
    status?: string;
}