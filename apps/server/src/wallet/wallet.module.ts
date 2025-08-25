import { forwardRef, Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './entities/wallet.entity';
import { UserModule } from 'src/user/user.module';
import { CurrencyModule } from 'src/currency/currency.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema }
    ]),
    forwardRef(() => UserModule),
    CurrencyModule
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService]
})
export class WalletModule { }
