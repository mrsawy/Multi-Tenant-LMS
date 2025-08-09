import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import axios, { AxiosError } from 'axios';
import { CreatePaymobSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { PaymobSubscriptionPlan } from './types/PaymobSubscriptionPlan.interface';
import { CreatePaymobSubscriptionDto, InitiateSubscriptionDto } from './dto/create-subscription.dto';
import { PaymobPaymentIntentionResponse } from './types/PaymobSubscription.interface';
import { SubscriptionType } from 'src/subscription/enum/subscriptionType.enum';
import { PlanService } from 'src/plan/plan.service';
import { CourseService } from 'src/course/course.service';
import { Course } from 'src/course/entities/course.entity';
import { Plan } from 'src/plan/entities/plan.entity';

@Injectable()
export class PaymentService {

  constructor(
    private readonly planService: PlanService,
    private readonly courseService: CourseService
  ) { }

  async getPaymentUrl(initiateSubscriptionDto: InitiateSubscriptionDto) {
    try {

      const token = await this.login();
      const { frequency, organizationId, planId, courseId, subscriptionType } = initiateSubscriptionDto

      let planName: string = '';
      let price: number = 0

      let foundedData: Course | Plan;
      if (subscriptionType == SubscriptionType.ORGANIZATION_PLAN) {

        const savedPlan = await this.planService.findOne(planId);
        if (!savedPlan) throw new NotFoundException("Plan Not Found")
        planName = `${savedPlan?.name}/${savedPlan?._id}/${frequency}`
        price = frequency == 30 ? savedPlan?.price.MONTHLY : savedPlan?.price.YEARLY
        foundedData = savedPlan;

      } else {
        const foundedCourse = await this.courseService.findOne(courseId);
        if (!foundedCourse) throw new NotFoundException("Course Not Found")
        planName = `${foundedCourse?.name}/${foundedCourse?._id}/${frequency}`
        price = Number(frequency == 30 ? foundedCourse.pricing.MONTHLY?.price : foundedCourse.pricing.YEARLY?.price)
        if (!price) throw new InternalServerErrorException("Invalid price")
        foundedData = foundedCourse;
      }
      const plans = await this.listAllSubscriptionPlans(token);
      let targetPlan = plans.find(plan => plan.name == planName)

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
          webhook_url: `${process.env.SECURED_BASE_URL}/payment/webhook`
        }
        targetPlan = await this.createSubscriptionPlan({ ...subscriptionPlanBody, token });
      }

      const subscriptionBody: CreatePaymobSubscriptionDto = {
        amount: targetPlan.amount_cents,
        currency: "EGP",
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


  async webhookReceive(webhookBody: any) {
    try {

      const { subscriptionType } = webhookBody.obj.payment_key_claims.extra

      if (subscriptionType == SubscriptionType.ORGANIZATION_PLAN) {
        // update the current plan associated with the organization

      }

      if (subscriptionType == SubscriptionType.USER_COURSE) {
        // enroll the user into the course


      }

      console.log({ webhookBody })

    } catch (error) {
      console.error(error)
      throw new BadRequestException(error)
    }
  }

}
