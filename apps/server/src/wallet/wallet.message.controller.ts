import { Controller, UseGuards } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  NatsContext,
} from '@nestjs/microservices';
import { WalletService } from './wallet.service';
import { PaymentOrchestratorService } from 'src/payment/services/payment-orchestrator.service';
import { PaymentProvider } from 'src/payment/strategies/interfaces/payment-strategy.interface';
import { Currency } from 'src/payment/enums/currency.enum';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import { AuthGuard } from 'src/auth/auth.guard';



@Controller('WalletMessageController')
export class WalletMessageController {
  constructor(
    private readonly walletService: WalletService,
  ) { }

  @UseGuards(AuthGuard)
  @MessagePattern('wallet.findByUser')
  async findByUser(@Ctx() context: IUserContext) {
    return await this.walletService.findByUserId(
      context.userPayload._id.toString(),
    );
  }


  // @MessagePattern('wallet.payment.status')
  // async getPaymentStatus(@Payload() data: any) {
  //   try {
  //     const { provider, paymentId } = data;

  //     if (!provider || !paymentId) {
  //       return {
  //         success: false,
  //         error: 'Provider and payment ID are required',
  //       };
  //     }

  //     const providerEnum = provider.toUpperCase() as PaymentProvider;

  //     const status = await this.paymentOrchestrator.getPaymentStatus(
  //       providerEnum,
  //       paymentId,
  //     );

  //     return {
  //       success: true,
  //       data: status,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  // }

  // @MessagePattern('wallet.transactions.list')
  // async getTransactions(@Payload() data: any, @Ctx() context: NatsContext) {
  //   try {
  //     const userId = data.userId || context.getArgs()[1]?.userId;
  //     const { page = 1, limit = 10 } = data;

  //     if (!userId) {
  //       return {
  //         success: false,
  //         error: 'User ID is required',
  //       };
  //     }

  //     const wallet = await this.walletService.findByUserId(userId);

  //     const transactions = await this.walletService.getWalletWithTransactions(
  //       wallet._id.toString(),
  //       page,
  //       limit,
  //     );

  //     return {
  //       success: true,
  //       data: transactions,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  // }

  // @MessagePattern('wallet.balance')
  // async getBalance(@Payload() data: any, @Ctx() context: NatsContext) {
  //   try {
  //     const userId = data.userId || context.getArgs()[1]?.userId;

  //     if (!userId) {
  //       return {
  //         success: false,
  //         error: 'User ID is required',
  //       };
  //     }

  //     const wallet = await this.walletService.findByUserId(userId);

  //     return {
  //       success: true,
  //       data: {
  //         balance: wallet.balance,
  //         currency: wallet.currency,
  //         isFrozen: wallet.isFrozen,
  //         isActive: wallet.isActive,
  //       },
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  // }
}
