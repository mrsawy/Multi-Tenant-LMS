import { Module } from '@nestjs/common';
import { PaymobService } from './payment.paymob.service';
import { PaymentController } from './payment.controller';
import { PlanModule } from 'src/plan/plan.module';
import { CourseModule } from 'src/course/course.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { AuthModule } from 'src/auth/auth.module';
import { PaypalPaymentService } from './payment.paypal.service';
import { PaymentWalletService } from './payment.wallet.service';
import { TransactionsService } from './transaction.service';
import { CurrencyModule } from 'src/currency/currency.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './entities/Transaction.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    PlanModule, CourseModule, OrganizationModule, EnrollmentModule, AuthModule, WalletModule
  ],
  controllers: [PaymentController],
  providers: [PaymobService, PaypalPaymentService, PaymentWalletService, TransactionsService],
  exports: [PaymobService, PaypalPaymentService, PaymentWalletService],
})
export class PaymentModule { }
