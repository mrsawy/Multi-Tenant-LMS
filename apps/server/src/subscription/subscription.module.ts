import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Subscription, SubscriptionSchema } from './entities/subscription.entity';
import { PlanModule } from 'src/plan/plan.module';
import { PaymentModule } from 'src/payment/payment.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Subscription.name, schema: SubscriptionSchema }]),
    PlanModule,
    PaymentModule
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule { }
