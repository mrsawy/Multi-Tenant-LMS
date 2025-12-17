import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
// import { InitiateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionType } from 'src/utils/enums/subscriptionType.enum';
import { PlanService } from 'src/plan/plan.service';
import { CourseService } from 'src/course/course.service';
import { Course } from 'src/course/entities/course.entity';
import { Plan } from 'src/plan/entities/plan.entity';
import { OrganizationService } from 'src/organization/organization.service';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { AccessType } from 'src/enrollment/enum/accessType.enum';
import { PayPalPlan } from './types/PaypalPlan.interface';
import { IntervalUnit, PayeePreferred, PayerSelected, PlanStatus, ShippingPreference, TenureType, UserAction } from './enums/paypal.enum';
import { CreatePaypalSubscriptionDto } from './dto/create-paypal-subscription.dto';
import { UserDocument } from 'src/user/entities/user.entity';
import { Currency } from './enums/currency.enum';
import { restore, shorten } from 'src/utils/encrypt';
import { PayPalBillingInfo, PayPalSaleResource, PayPalSubscriptionResource, PayPalWebhookBody, PayPalWebhookBodyType } from './types/paybalWebhookBody.interface';
import { subtractDays } from 'src/utils/dateUtils';
import { SubscriptionStatus } from 'src/utils/enums/subscriptionStatus.enum';
import { InitiateSubscriptionDto } from 'src/enrollment/dto/create-enrollment.dto';


@Injectable()
export class PaypalPaymentService {

  constructor(
    private readonly planService: PlanService,
    private readonly courseService: CourseService,
    private readonly organizationService: OrganizationService,
    private readonly enrollmentService: EnrollmentService
  ) { }

  async getPaymentUrl(initiateSubscriptionDto: InitiateSubscriptionDto, user: UserDocument) {


    try {
      const token = await this.login({ username: process.env.PAYPAL_CLIENT_ID as string, password: process.env.PAYPAL_SECRET as string });
      const { frequency, organizationId, planId, courseId, subscriptionType, userId } = initiateSubscriptionDto

      let subscribableEntity: Course | Plan;
      let price: number;
      let currency: string = Currency.USD;
      // let currency: Currency = Currency.USD;

      if (subscriptionType === SubscriptionType.ORGANIZATION_PLAN) {
        subscribableEntity = await this.planService.findOne(planId);
        if (!subscribableEntity) throw new NotFoundException("Plan Not Found");
        price = frequency == 30 ? subscribableEntity?.price.MONTHLY : subscribableEntity?.price.YEARLY
      } else if (subscriptionType === SubscriptionType.USER_COURSE) {
        subscribableEntity = await this.courseService.findOne(courseId);
        if (!subscribableEntity) throw new NotFoundException("Course Not Found");
        const pricing = this.courseService.getCoursePricing(subscribableEntity, frequency);
        ({ price, currency } = pricing);
        if (!price) throw new InternalServerErrorException("Invalid price")
      } else {
        throw new BadRequestException("Invalid subscription type");
      }

      if (!subscribableEntity.paypalPlanId) {
        const paypalProduct = await this.createPaypalProduct({ name: subscribableEntity.name, description: subscribableEntity.description }, token)
        const planData = {
          token,
          product_id: paypalProduct.id,
          name: subscribableEntity.name,
          description: subscribableEntity.description,
          type: "INFINITE" as "INFINITE",
          status: PlanStatus.ACTIVE,
          "billing_cycles": [{
            "frequency": { "interval_unit": frequency == 30 ? IntervalUnit.MONTH : IntervalUnit.YEAR, "interval_count": 1 },
            "total_cycles": 0,
            "tenure_type": TenureType.REGULAR, "sequence": 1, "pricing_scheme": { "fixed_price": { "value": `${price.toFixed(2)}`, "currency_code": currency } }
          }
          ],
          "payment_preferences": {
            "auto_bill_outstanding": true,
          },
          "taxes": {
            "percentage": "10",
            "inclusive": false
          }
        }
        const paypalPlan = await this.createPlan(planData, token);
        console.log({ paypalProduct, paypalPlan })

        subscribableEntity.paypalPlanId = paypalPlan.id;
        await subscribableEntity.save();

      }


      const { country, city, street, country_code } = initiateSubscriptionDto.billing_data;

      const subscriptionData = {
        custom_id: shorten(JSON.stringify({ frequency, organizationId, planId, courseId, subscriptionType, userId, billingCycle: frequency == 30 ? BillingCycle.MONTHLY : BillingCycle.YEARLY })),
        plan_id: subscribableEntity.paypalPlanId,
        start_time: new Date(Date.now() + 6 * 1000).toISOString(),
        shipping_amount: { currency_code: currency, value: 0 },
        // auto_renewal: true,
        subscriber: {
          name: {
            given_name: user.firstName,
            surname: user.lastName
          },
          email_address: user.email,
          shipping_address: {
            name: {
              full_name: `${user.firstName} ${user.lastName}`
            },
            address: {
              address_line_1: `${country} ${city} ${street}`,
              admin_area_2: `${country} ${city} ${street}`,
              admin_area_1: `${country} ${city} ${street}`,
              postal_code: `${country} ${city} ${street}`,
              country_code
            }
          }
        },
        application_context: {
          brand_name: subscribableEntity.name,
          locale: "en-US", shipping_preference: ShippingPreference.SET_PROVIDED_ADDRESS,
          user_action: UserAction.SUBSCRIBE_NOW,
          payment_method: {
            payer_selected: PayerSelected.PAYPAL,
            payee_preferred: PayeePreferred.IMMEDIATE_PAYMENT_REQUIRED
          },
          return_url: process.env.HOST_URL as string,
          cancel_url: process.env.HOST_URL as string,
        }

      }

      const subscription = await this.createSubscription(subscriptionData, token);


      const links = subscription.links.find(link => link.rel === 'approve');
      if (!links) {
        throw new BadRequestException('No approval link found in the subscription response');
      }
      return {
        approvalUrl: links.href,
        subscriptionId: subscription.id,
        planId: subscribableEntity.paypalPlanId
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error creating PayPal subscription:', error.response?.data);
        throw new InternalServerErrorException('Failed to create PayPal subscription');
      }
      throw error;
    }
  }

  async createPlan(paypalPlan: PayPalPlan, token: string) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    };

    const response = await axios.post(`${process.env.PAYPAL_BASE_URL}/v1/billing/plans`, paypalPlan, { headers });
    console.log('Plan created:', response.data);
    return response.data;
  }

  async createPaypalProduct({ name, description, type }: { name: string, description: string, type?: string }, token: string) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    };

    const response = await axios.post(`${process.env.PAYPAL_BASE_URL}/v1/catalogs/products`, { name, description, type }, { headers });
    console.log('Product created:', response.data);
    return response.data;
  }

  async createSubscription(createPaymobSubscriptionDto: CreatePaypalSubscriptionDto, token: string) {

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    };

    try {
      const response = await axios.post(`${process.env.PAYPAL_BASE_URL}/v1/billing/subscriptions`, createPaymobSubscriptionDto, { headers });
      console.log('Subscription created:', response.data);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error creating subscription:', error.response?.data);
        throw new InternalServerErrorException('Failed to create PayPal subscription');
      }
      throw error;
    }
  }

  async login({ username, password }: { username: string, password: string }) {
    const response = await axios.post(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, 'grant_type=client_credentials', { auth: { username, password }, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    return response.data.access_token as string;

  }

  async webhookSubscription(webhookBody: PayPalWebhookBodyType) {

    const { resource, id, links: webhookLinks } = webhookBody;

    if (webhookBody.event_type === "BILLING.SUBSCRIPTION.ACTIVATED") {
      let subResource = resource as PayPalSubscriptionResource
      const { start_time, create_time, update_time, subscriber, billing_info, links } = subResource;
      const { frequency, organizationId, planId, courseId, subscriptionType, userId } = JSON.parse(restore(subResource.custom_id));
      const next_billing_time = billing_info?.next_billing_time;
      console.dir({ subscriber, billing_info, links, webhookLinks }, { depth: null })
      const subscription: SubscriptionTypeDef = {
        reminder_days: 0,
        status: SubscriptionStatus.ACTIVE,
        starts_at: start_time,
        next_billing: next_billing_time as string,
        reminder_date: subtractDays(next_billing_time as string, 5),
        transaction_id: id,
        billing: {
          email: subscriber.email_address,
          last_name: subscriber.name.surname,
          first_name: subscriber.name.given_name,
          amount: Number((billing_info as PayPalBillingInfo).outstanding_balance.value),
          currency: (billing_info as PayPalBillingInfo).outstanding_balance.currency_code,
          billingCycle: frequency == 30 ? BillingCycle.MONTHLY : BillingCycle.YEARLY,
        },
        createdAt: create_time, updatedAt: update_time as string
      }

      if (subscriptionType == SubscriptionType.ORGANIZATION_PLAN) {
        return await this.organizationService.createOrganizationSubscription(organizationId, planId, subscription)
      }

      if (subscriptionType == SubscriptionType.USER_COURSE) {
        return await this.enrollmentService.enrollUserToCourse(userId, courseId, AccessType.SUBSCRIPTION, subscription)
      }
    }


    if (webhookBody.event_type === "PAYMENT.SALE.COMPLETED") {
      let subResource = resource as PayPalSaleResource
      const { billing_agreement_id, amount, create_time, update_time } = subResource;
      console.dir({ subResource }, { depth: null })

      if (!billing_agreement_id) {
        throw new BadRequestException("No billing agreement id found in the sale resource")
      }

      const subscriptionDetails = await this.getSubscriptionDetails(billing_agreement_id);
      const { organizationId, courseId, subscriptionType, userId } = JSON.parse(restore(subscriptionDetails.custom_id));

      const subscription: Partial<SubscriptionTypeDef> = {
        reminder_days: 5,
        status: SubscriptionStatus.ACTIVE,
        starts_at: subscriptionDetails.start_time,
        next_billing: subscriptionDetails.billing_info?.next_billing_time as string,
        reminder_date: subtractDays(subscriptionDetails.billing_info?.next_billing_time as string, 5),
        transaction_id: subscriptionDetails.id,
        createdAt: create_time, updatedAt: update_time
      }

      if (subscriptionType == SubscriptionType.ORGANIZATION_PLAN) {
        return await this.organizationService.renewOrganizationSubscription(organizationId, subscription)
      }

      if (subscriptionType == SubscriptionType.USER_COURSE) {
        return await this.enrollmentService.updateUserSubscription(userId, courseId, subscription)
      }
    }
  }

  async getSubscriptionDetails(subscriptionId: string) {
    try {
      const token = await this.login({ username: process.env.PAYPAL_CLIENT_ID as string, password: process.env.PAYPAL_SECRET as string });
      const subscriptionResponse = await axios.get<PayPalSubscriptionResource>(`${process.env.PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        }
      });

      return subscriptionResponse.data
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching subscription details:', error.response?.data);
        throw new InternalServerErrorException('Failed to fetch PayPal subscription details');
      }
      throw error;
    }
  }
}
