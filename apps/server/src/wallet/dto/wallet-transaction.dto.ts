
// src/wallet/dto/wallet-transaction.dto.ts (update existing)
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import mongoose from 'mongoose';
import { Currency } from 'src/payment/enums/currency.enum';

export class WalletTransactionDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: Currency;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}