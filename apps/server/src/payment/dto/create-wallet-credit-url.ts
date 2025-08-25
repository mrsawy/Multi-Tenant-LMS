import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { Currency } from "../enums/currency.enum";

export class CreateWalletCreditUrlDto {

    @IsNumber()
    amount_cents: number;

    @IsEnum(Currency, { message: "currency must be one of the following values: " + Object.values(Currency).join(" - ") })
    currency: Currency;

    @IsString()
    @IsOptional()
    description?: string;

}