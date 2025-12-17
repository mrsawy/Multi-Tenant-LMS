import { Controller, UseGuards } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  NatsContext,
} from '@nestjs/microservices';

import { PaymentOrchestratorService } from 'src/payment/services/payment-orchestrator.service';
import { PaymentProvider } from 'src/payment/strategies/interfaces/payment-strategy.interface';
import { Currency } from 'src/payment/enums/currency.enum';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreatePaymentUrlDto } from './dto/create-payment-url.dto';

@Controller('payment')
export class PaymentMessageController {
  constructor(
    private readonly paymentOrchestrator: PaymentOrchestratorService,
  ) {}

  @UseGuards(AuthGuard)
  @MessagePattern('payment.create-payment-url')
  async findByUser(
    @Payload() payload: CreatePaymentUrlDto,
    @Ctx() context: IUserContext,
  ) {
    return await this.paymentOrchestrator.createPaymentUrl({
      ...payload,
      user: context.userPayload,
    });
  }
}
