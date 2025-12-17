import { forwardRef, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentHttpController } from './payment.http.controller';
import { PaymentMessageController } from './payment.message.controller';
import { PaymentOrchestratorService } from './services/payment-orchestrator.service';
import { PaymobStrategy } from './strategies/paymob.strategy';
import { PaypalStrategy } from './strategies/paypal.strategy';
import { WalletModule } from 'src/wallet/wallet.module';
import { AuthModule } from 'src/auth/auth.module';
import { KashierStrategy } from './strategies/kashier.strategy';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => AuthModule),
    forwardRef(() => EnrollmentModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => WalletModule),
  ],
  controllers: [PaymentMessageController, PaymentHttpController],
  providers: [
    PaymentOrchestratorService,
    PaymobStrategy,
    PaypalStrategy,
    KashierStrategy,

  ],
  exports: [PaymentOrchestratorService], // Export for use in WalletModule
})
export class PaymentModule implements OnModuleInit {
  constructor(
    private readonly orchestrator: PaymentOrchestratorService,
    private readonly paymobStrategy: PaymobStrategy,
    private readonly paypalStrategy: PaypalStrategy,
    private readonly kashierStrategy: KashierStrategy,
  ) { }

  onModuleInit() {
    this.orchestrator.registerStrategy(this.paymobStrategy);
    this.orchestrator.registerStrategy(this.paypalStrategy);
    this.orchestrator.registerStrategy(this.kashierStrategy);

    console.log(
      '✅ Payment strategies registered:',
      this.orchestrator.getAvailableProviders(),
    );
  }
}
