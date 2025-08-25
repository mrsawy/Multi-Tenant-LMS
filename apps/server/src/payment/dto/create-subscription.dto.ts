import { IsString, IsOptional, IsDateString, IsEnum, IsMongoId, ValidateIf, ValidateNested, IsNotEmpty, IsEmail, IsInt, IsArray } from 'class-validator';
import { BillingCycle } from '../../utils/enums/billingCycle.enum';
import { CreatePaymobSubscriptionPlanDto } from 'src/payment/dto/create-subscription-plan.dto';
import { Type } from 'class-transformer';
import { SubscriptionType } from 'src/utils/enums/subscriptionType.enum';


export class customerDto {
    @IsNotEmpty()
    @IsMongoId()
    userId: string

    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;
    @IsString()
    @IsNotEmpty()
    phone_number: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

}


// export class ExtrasDto {
//     @IsMongoId()
//     @IsNotEmpty()
//     planId: string;

//     @IsMongoId()
//     @IsNotEmpty()
//     organizationId: string;

//     @IsEnum(SubscriptionType)
//     @IsNotEmpty()
//     subscriptionType: SubscriptionType;
// }


export class PaymobBillingData {
    @IsOptional()
    @IsString()
    apartment: string;

    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsString()
    street: string;

    @IsString()
    @IsOptional()
    building?: string;

    @IsString()
    @IsNotEmpty()
    phone_number: string;

    @IsString()
    city: string;

    @IsString()
    country: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    floor?: string;

    // @IsString()
    // state: string;

    @IsString()
    @IsOptional()
    extra_description: string;

    @IsString()
    country_code:string

}


export class InitiateSubscriptionDto extends CreatePaymobSubscriptionPlanDto {
    @IsEnum(SubscriptionType)
    subscriptionType: SubscriptionType

    @ValidateIf(o => o.subscriptionType == SubscriptionType.ORGANIZATION_PLAN)
    @IsMongoId()
    organizationId: string;

    @ValidateIf(o => o.subscriptionType == SubscriptionType.ORGANIZATION_PLAN)
    @IsMongoId()
    planId: string;

    @ValidateIf(o => o.subscriptionType == SubscriptionType.USER_COURSE)
    @IsMongoId()
    userId: string

    @ValidateIf(o => o.subscriptionType == SubscriptionType.USER_COURSE)
    @IsMongoId()
    courseId: string

    @IsEnum(BillingCycle)
    billingCycle: BillingCycle

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



export class CreatePaymobSubscriptionDto {
    @IsInt()
    amount: number;

    @IsString()
    currency: string;

    @IsArray()
    @IsInt({ each: true })
    payment_methods: number[];

    @IsInt()
    subscription_plan_id: number;

    @IsOptional()
    items: any[];

    @ValidateNested()
    @Type(() => PaymobBillingData)
    billing_data: PaymobBillingData;

    @IsOptional()
    extras: any;

}
