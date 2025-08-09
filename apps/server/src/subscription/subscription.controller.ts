import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
// import { CreateSubscriptionDto } from './dto/create-subscription.dto';
// import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  // @Post("/initiate")
  // async initiate(@Body() createSubscriptionDto: CreateSubscriptionDto) {
  //   return await this.subscriptionService.initiateCreatingSubscription(createSubscriptionDto);
  // }

  // @Post("/webhook")
  // async webhook(@Body() webhookBody: any) {

  //   return await this.subscriptionService.webhookReceive(webhookBody)



  // }

}
