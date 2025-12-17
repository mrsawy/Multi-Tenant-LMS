import { forwardRef, Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletHttpController } from './wallet.http.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './entities/wallet.entity';
import { UserModule } from 'src/user/user.module';
import { CurrencyModule } from 'src/currency/currency.module';
import { WalletControllerMessage } from './wallet.message.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema }
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
    CurrencyModule,

  ],
  controllers: [WalletHttpController, WalletControllerMessage],
  providers: [WalletService],
  exports: [WalletService]
})
export class WalletModule { }
