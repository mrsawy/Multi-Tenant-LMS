import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletService } from './wallet.service';
import { WalletHttpController } from './wallet.http.controller';
import { WalletMessageController } from './wallet.message.controller';
import { Wallet, WalletSchema } from './entities/wallet.entity';
import { UserModule } from 'src/user/user.module';
import { CurrencyModule } from 'src/currency/currency.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { PaymentModule } from 'src/payment/payment.module';
import { AuthModule } from 'src/auth/auth.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    CurrencyModule,
    TransactionModule,
    forwardRef(() => OrganizationModule),
    forwardRef(() => CourseModule),
    forwardRef(() => AuthModule),
    
  ],
  controllers: [WalletHttpController, WalletMessageController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule { }
