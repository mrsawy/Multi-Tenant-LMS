import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import axios, { AxiosError } from 'axios';
import { CreatePaymobSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { PaymobSubscriptionPlan } from './types/PaymobSubscriptionPlan.interface';
import { CreatePaymobSubscriptionDto, InitiateSubscriptionDto } from './dto/create-subscription.dto';
import { PaymobPaymentIntentionResponse } from './types/PaymobSubscription.interface';
import { SubscriptionType } from 'src/utils/enums/subscriptionType.enum';
import { PlanService } from 'src/plan/plan.service';
import { CourseService } from 'src/course/course.service';
import { Course } from 'src/course/entities/course.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { OrganizationService } from 'src/organization/organization.service';
import { SubscriptionStatus } from 'src/utils/enums/subscriptionStatus.enum';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';
import { PaymobTransaction, PaymobWebhookTransaction } from './types/transaction.interface';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { AccessType } from 'src/enrollment/enum/accessType.enum';
import { Currency } from './enums/currency.enum';

@Injectable()
export class PaymobService {

  constructor(
    private readonly planService: PlanService,
    private readonly courseService: CourseService,
    private readonly organizationService: OrganizationService,
    private readonly enrollmentService: EnrollmentService
  ) { }

  async getPaymentUrl(initiateSubscriptionDto: InitiateSubscriptionDto) {
    try {

      const token = await this.login();
      const { frequency, organizationId, planId, courseId, subscriptionType, userId } = initiateSubscriptionDto

      let planName: string = '';
      let price: number = 0
      let foundedData: Course | Plan;
      let currency: string = Currency.USD;

      if (subscriptionType == SubscriptionType.ORGANIZATION_PLAN) {

        const savedPlan = await this.planService.findOne(planId);
        if (!savedPlan) throw new NotFoundException("Plan Not Found")
        foundedData = savedPlan;
        price = frequency == 30 ? savedPlan?.price.MONTHLY : savedPlan?.price.YEARLY

      } else {
        const foundedCourse = await this.courseService.findOne(courseId);
        if (!foundedCourse) throw new NotFoundException("Course Not Found")
        foundedData = foundedCourse;
        const pricing = this.courseService.getCoursePricing(foundedCourse, frequency);
        ({ price, currency } = pricing);
      }

      planName = JSON.stringify({ name: foundedData?.name, organizationId, planId, courseId, userId, subscriptionType, frequency })


      const plans = await this.listAllSubscriptionPlans(token);
      let targetPlan = plans.find(plan => {
        try {
          const parsedName = JSON.parse(plan.name)
          parsedName.name == name;
        } catch (error) {
          plan.name == planName
        }
      })

      if (!targetPlan) {
        let subscriptionPlanBody: PaymobSubscriptionPlan = {
          frequency: frequency,
          name: planName,
          reminder_days: frequency - 3,
          retrial_days: 1,
          plan_type: "rent",
          amount_cents: price * 100,
          use_transaction_amount: true,
          is_active: true,
          integration: Number(process.env.MOTO_INTEGRATION_ID),
          webhook_url: `${process.env.SECURED_BASE_URL}/payment/subscription/webhook`
        }
        targetPlan = await this.createSubscriptionPlan({ ...subscriptionPlanBody, token });
      }

      const subscriptionBody: CreatePaymobSubscriptionDto = {
        amount: targetPlan.amount_cents,
        currency,
        payment_methods: [Number(process.env.S_INTEGRATION_ID)],
        subscription_plan_id: Number(targetPlan.id),
        items: [{ ...foundedData.toObject(), amount: price * 100 }],
        billing_data: initiateSubscriptionDto.billing_data,
        extras: {
          organizationId, planId, subscriptionType
        },
      }
      const subscription = await this.createSubscription(subscriptionBody)
      const paymentUrl = `${process.env.BASE_PAYMOB}/unifiedcheckout/?publicKey=${process.env.PUBLIC_KEY}&clientSecret=${subscription.client_secret}`
      return paymentUrl
    } catch (error) {
      console.error(error.message, { error })
      throw new BadRequestException(error.message)
    }
  }
  async createSubscription(createPaymobSubscriptionDto: CreatePaymobSubscriptionDto) {
    try {

      const response = await axios.post<PaymobPaymentIntentionResponse>(process.env.BASE_PAYMOB + "/v1/intention/", createPaymobSubscriptionDto, {
        headers: {
          Authorization: "Token " + process.env.PAYMOB_SECRET_KEY
        }
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error:', error.message, error.response);
      } else {
        console.error('Unknown error:', error);
      }
      throw new BadRequestException(error)
    }
  }

  async createSubscriptionPlan(paymobSubscriptionPlan: PaymobSubscriptionPlan & { token: string }) {
    const response = await axios.post<PaymobSubscriptionPlan>(process.env.BASE_PAYMOB + "/api/acceptance/subscription-plans", paymobSubscriptionPlan, {
      headers: {
        Authorization: "Bearer " + paymobSubscriptionPlan.token
      }
    })
    const plan = response.data;
    if (!plan) throw new InternalServerErrorException("Couldn't create plan")
    return plan
  }

  async listAllSubscriptionPlans(token: string): Promise<PaymobSubscriptionPlan[]> {
    let allPlans: PaymobSubscriptionPlan[] = [];
    let pageNumber = 1;
    let hasNext = true;

    while (hasNext) {
      const response = await axios.get(
        process.env.BASE_PAYMOB + "/api/acceptance/subscription-plans?page=" + pageNumber,
        {
          headers: {
            Authorization: "Bearer " + token
          }
        }
      );
      allPlans = [...allPlans, ...(response.data.results || [])];
      hasNext = !!response.data.next;
      // hasNext = false;
      pageNumber++;
    }

    return allPlans;
  }

  async login() {
    const response = await axios.post(process.env.BASE_PAYMOB + "/api/auth/tokens", {
      api_key: process.env.API_KEY
    });

    const { token } = response.data as { token: string };
    return token;
  }

  async getTransactionData(id: string) {
    try {

      const token = await this.login();
      const transactionData = await axios.get<PaymobTransaction>(process.env.BASE_PAYMOB + "/api/acceptance/transactions/" + id, {
        headers: {
          Authorization: "Bearer " + token
        }
      })

      return transactionData.data
    } catch (error) {
      throw new BadRequestException(error)
    }

  }

  async webhookSubscription(webhookBody: any) {
    try {
      if (!webhookBody.subscription_data || webhookBody.trigger_type !== 'Subscription Created') { console.log({ webhookBody }); return webhookBody }

      const { subscription_data, transaction_id } = webhookBody
      const { reminder_days, status, starts_at, next_billing, reminder_date, ends_at, resumed_at, suspended_at, reactivated_at, name } = subscription_data;
      const { frequency, organizationId, planId, courseId, subscriptionType, userId } = JSON.parse(name)
      const transactionData = await this.getTransactionData(transaction_id)
      const subscription: SubscriptionTypeDef = {
        reminder_days, status, starts_at, next_billing, reminder_date, ends_at, resumed_at, suspended_at, reactivated_at, transaction_id,
        billing: { ...transactionData.billing_data, billingCycle: frequency == 30 ? BillingCycle.MONTHLY : BillingCycle.YEARLY, amount: transactionData.amount_cents, currency: transactionData.currency },
        createdAt: new Date(transactionData.created_at),
        updatedAt: new Date(transactionData.updated_at)
      };

      if (subscriptionType == SubscriptionType.ORGANIZATION_PLAN) {
        return await this.organizationService.createOrganizationSubscription(organizationId, planId, subscription)
      }

      if (subscriptionType == SubscriptionType.USER_COURSE) {
        return await this.enrollmentService.enrollUserToCourse(userId, courseId, AccessType.SUBSCRIPTION, subscription)
      }

    } catch (error) {
      console.error(error)
      throw new BadRequestException(error)
    }
  }



  async webhookTransaction(webhookBody: PaymobWebhookTransaction) {



  }



}
