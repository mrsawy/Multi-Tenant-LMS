import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
  Query,
  Request,
} from '@nestjs/common';
import { PaymentOrchestratorService } from './services/payment-orchestrator.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';
import { PaymentProvider } from './strategies/interfaces/payment-strategy.interface';
import { CreatePaymentUrlDto } from './dto/create-payment-url.dto';
import { PaymobWebhookTransaction } from './types/transaction.interface';
import { PaymentPurpose } from './types/PaymentPurpose.interface';
import { EnrollmentService } from 'src/enrollment/services/enrollment.service';
import { AccessType } from 'src/enrollment/enum/accessType.enum';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';
import { SubscriptionStatus } from 'src/utils/enums/subscriptionStatus.enum';
import { WalletService } from 'src/wallet/wallet.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { PaymentMethod } from 'src/transaction/entities/transaction.entity';

@Controller('payment')
export class PaymentHttpController {
  constructor(
    private readonly paymentOrchestrator: PaymentOrchestratorService,
    private readonly enrollmentService: EnrollmentService,
    private readonly walletService: WalletService,
  ) { }

  @UseGuards(AuthGuard)
  @Post('/create-payment-url')
  async createPaymentUrl(
    @Body() body: CreatePaymentUrlDto,
    @Req() req: IUserRequest,
  ) {
    return await this.paymentOrchestrator.createPaymentUrl({
      ...body,
      user: req.user,
    });
  }

  @Post('/webhook/paymob')
  async handleWebhook(@Body() body: PaymobWebhookTransaction) {
    console.dir({ body })
    const result = await this.paymentOrchestrator.processWebhook(PaymentProvider.PAYMOB, body)
    const { userId, courseId, billingCycle, purpose } = result.metadata
    if (userId && courseId && billingCycle && purpose == PaymentPurpose.COURSE_PURCHASE) {
      let accessType: AccessType = AccessType.SUBSCRIPTION;
      if (billingCycle == BillingCycle.ONE_TIME) { accessType = AccessType.PAID_ONCE }
      const subscription: SubscriptionTypeDef = {
        status: SubscriptionStatus.ACTIVE,
        starts_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ends_at: this.enrollmentService.calculateEndDate(billingCycle),
        billing: {
          ...body.obj.payment_key_claims.extra.billingData,
          amount: body.obj.amount_cents / 100,
          currency: body.obj.currency,
          billingCycle: billingCycle,
        },
      };
      const organizationWallet = await this.walletService.filterOne({ courseId });
      await this.walletService.credit({
        transactionDto: {
          amount: result.amount,
          currency: result.currency,
          reference: result.transactionId,
          description: 'Wallet credit from course purchase',
          metadata: {
            paymentProvider: PaymentProvider.PAYMOB,
            paymentTransactionId: result.transactionId,
            paymentStatus: result.status,
            ...result.metadata,
          },
        },
        id: organizationWallet._id.toString(),
      });
      await this.walletService.debit({
        transactionDto: {
          amount: result.amount,
          currency: result.currency,
          reference: result.transactionId,
          description: 'Debit for course purchase',
          metadata: {
            paymentProvider: PaymentProvider.PAYMOB,
            paymentTransactionId: result.transactionId,
            paymentStatus: result.status,
            ...result.metadata,
          },
        },
        userId: userId as string,
        purpose: PaymentPurpose.COURSE_PURCHASE,
        paymentMethod: PaymentMethod.DIRECT,
      });
      return await this.enrollmentService.enrollUserToCourse(userId, courseId, accessType, subscription)
    } else if (userId && purpose == PaymentPurpose.WALLET_CREDIT) {
      const creditResult = await this.walletService.credit({
        transactionDto: {
          amount: result.amount,
          currency: result.currency,
          reference: result.transactionId,
          description: 'Wallet credit from payment',
          metadata: {
            paymentProvider: PaymentProvider.PAYMOB,
            paymentTransactionId: result.transactionId,
            paymentStatus: result.status,
            ...result.metadata,
          },
        },
        userId: userId as string,
        fromUserId: userId as string,
      });

      return creditResult;
    }

  }

  /**
   * Create payment URL for wallet credit
   * POST /payment/wallet/credit
   */
  // @UseGuards(AuthGuard)
  // @Post('wallet/credit')
  // async createWalletCreditUrl(
  //   @Body() dto: CreateWalletPaymentDto,
  //   @Req() req: IUserRequest,
  // ) {
  //   return await this.paymentOrchestrator.createWalletCreditPayment(
  //     dto.provider,
  //     dto.amount,
  //     dto.currency,
  //     req.user,
  //   );
  // }

  /**
   * Unified webhook endpoint
   * POST /payment/webhook/:provider
   */
  // @Post('webhook/:provider')
  // async handleWebhook(
  //   @Param('provider') provider: string,
  //   @Body() webhookBody: any,
  // ) {
  //   const providerEnum = provider.toUpperCase() as PaymentProvider;

  //   return await this.paymentOrchestrator.processWalletCreditWebhook(
  //     providerEnum,
  //     webhookBody,
  //   );
  // }

  /**
   * Get payment status
   * GET /payment/status/:provider/:paymentId
   */
  // @UseGuards(AuthGuard)
  // @Get('status/:provider/:paymentId')
  // async getPaymentStatus(
  //   @Param('provider') provider: string,
  //   @Param('paymentId') paymentId: string,
  // ) {
  //   const providerEnum = provider.toUpperCase() as PaymentProvider;

  //   return await this.paymentOrchestrator.getPaymentStatus(
  //     providerEnum,
  //     paymentId,
  //   );
  // }

  /**
   * Get available payment providers
   * GET /payment/providers
   */
  // @Get('providers')
  // async getProviders() {
  //   return {
  //     providers: this.paymentOrchestrator.getAvailableProviders(),
  //   };
  // }
}
