import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InitiateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionType } from 'src/subscription/enum/subscriptionType.enum';
// import { CreateSubscriptionDto } from 'src/subscription/dto/create-subscription.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {
  }


  @Post("/initiate")
  async initiate(@Body() initiateSubscriptionDto: InitiateSubscriptionDto) {
      return await this.paymentService.getPaymentUrl(initiateSubscriptionDto);
  }




}
