import { BadRequestException, Injectable } from '@nestjs/common';
// import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subscription } from './entities/subscription.entity';
import { Model } from 'mongoose';
import { PlanService } from 'src/plan/plan.service';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { PaymentService } from 'src/payment/payment.service';
import { SubscriptionType } from './enum/subscriptionType.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name) private readonly subscriptionModel: Model<Subscription>,
    private readonly planService: PlanService,
    private readonly paymentService: PaymentService
  ) { }

 

 

}
