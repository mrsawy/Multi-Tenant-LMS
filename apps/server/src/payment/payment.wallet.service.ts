import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import axios, { AxiosError } from 'axios';
import { CreatePaymobSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { PaymobSubscriptionPlan } from './types/PaymobSubscriptionPlan.interface';
// import { CreatePaymobSubscriptionDto, InitiateSubscriptionDto } from './dto/create-subscription.dto';
import { PaymobPaymentIntentionResponse } from './types/PaymobSubscription.interface';
import { SubscriptionType } from 'src/utils/enums/subscriptionType.enum';
import { PlanService } from 'src/plan/plan.service';
import { CourseService } from 'src/course/services/course.service';
import { Course } from 'src/course/entities/course.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { OrganizationService } from 'src/organization/organization.service';
import { SubscriptionStatus } from 'src/utils/enums/subscriptionStatus.enum';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';
import {
  PaymobTransaction,
  PaymobWebhookTransaction,
} from './types/transaction.interface';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { AccessType } from 'src/enrollment/enum/accessType.enum';
import { PaymobService } from './payment.paymob.service';

import { User, UserDocument } from 'src/user/entities/user.entity';
import {
  PaymobPaymentLinkBody,
  PaymobPaymentLinkResponse,
} from './types/PaymobPaymentLink.interface';
// import { TransactionsService } from './transaction.service';
import { Connection } from 'mongoose';
import { Currency } from './enums/currency.enum';
import { WalletService } from 'src/wallet/wallet.service';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class PaymentWalletService {
  constructor(
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly paymobService: PaymobService,
    @InjectConnection() private readonly connection: Connection,
    private readonly walletService: WalletService,
  ) {}

  // async createPaymobPaymentLink(
  //   createWalletCreditUrlDto: CreateWalletCreditUrlDto,
  //   user: UserDocument,
  //   extras: Object = {},
  // ) {
  //   const token = await this.paymobService.login();

  //   const paymobPaymentLinkBody: PaymobPaymentLinkBody = {
  //     amount_cents: createWalletCreditUrlDto.amount_cents,
  //     currency: createWalletCreditUrlDto.currency,
  //     expires_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
  //     payment_methods: process.env.S_INTEGRATION_ID as string,
  //     email: user.email,
  //     is_live: process.env.PAYMOB_ISLIVE as string,
  //     full_name: `${user.firstName} ${user.lastName}`,
  //     phone_number: '+201044662456',
  //     description: createWalletCreditUrlDto.description || 'Wallet Credit',
  //     notification_url:
  //       process.env.SECURED_BASE_URL +
  //       '/payment/wallet/paymob/credit-url/webhook',
  //     redirection_url:
  //       process.env.SECURED_BASE_URL +
  //       '/payment/wallet/paymob/credit-url/webhook',
  //     ...extras,
  //   };

  //   const formData = new FormData();
  //   (
  //     Object.entries(paymobPaymentLinkBody) as [
  //       keyof PaymobPaymentLinkBody,
  //       any,
  //     ][]
  //   ).forEach(([key, value]) => {
  //     if (value !== undefined && value !== null) {
  //       formData.append(key, String(value));
  //     }
  //   });

  //   const response = await axios.post<PaymobPaymentLinkResponse>(
  //     process.env.BASE_PAYMOB + '/api/ecommerce/payment-links',
  //     formData,
  //     {
  //       headers: {
  //         Authorization: 'Bearer ' + token,
  //       },
  //     },
  //   );
  //   const { data } = response;
  //   return { url: data.client_url, expiresAt: data.expires_at };
  // }
}
