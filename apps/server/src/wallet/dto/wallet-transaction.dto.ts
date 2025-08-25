import { PartialType } from '@nestjs/mapped-types';
import { CreateWalletDto } from './create-wallet.dto';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class WalletTransactionDto {
    @IsNumber()
    @Min(0.01)
    amount: number;

    @IsString()
    @IsOptional()
    currency: string = 'USD';

    // @IsString()
    // @IsOptional()
    // description?: string;

    // @IsString()
    // @IsOptional()
    // transactionType?: 'credit' | 'debit' = 'credit';
}
