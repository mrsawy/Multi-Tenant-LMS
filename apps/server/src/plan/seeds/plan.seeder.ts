import { Model } from 'mongoose';
import { Plan } from '../entities/plan.entity';
import { PlanTier } from '../enum/planTier.enum';
import { BillingCycle } from '../../utils/enums/billingCycle.enum';

export class PlanSeeder {
  constructor(private readonly planModel: Model<Plan>) {}

  async seed() {
    const plans = [
      {
        name: 'Free Plan',
        description: 'Perfect for starters',
        price: {
          [BillingCycle.MONTHLY]: 0,
          [BillingCycle.YEARLY]: 0,
          [BillingCycle.ONE_TIME]: 0,
        },
        tier: PlanTier.FREE,
        features: {
          maxUsers: 10,
          maxCourses: 2,
          maxStorageGB: 1,
          analytics: false,
          prioritySupport: false,
        },
        isActive: true,
      },
      {
        name: 'Basic Plan',
        description: 'For small teams',
        price: {
          [BillingCycle.MONTHLY]: 20,
          [BillingCycle.YEARLY]: 200,
          [BillingCycle.ONE_TIME]: 500,
        },
        tier: PlanTier.BASIC,
        features: {
          maxUsers: 50,
          maxCourses: 10,
          maxStorageGB: 10,
          analytics: true,
          prioritySupport: false,
        },
        isActive: true,
      },
      {
        name: 'Pro Plan',
        description: 'For growing organizations',
        price: {
          [BillingCycle.MONTHLY]: 50,
          [BillingCycle.YEARLY]: 500,
          [BillingCycle.ONE_TIME]: 1200,
        },
        tier: PlanTier.PRO,
        features: {
          maxUsers: 200,
          maxCourses: 50,
          maxStorageGB: 50,
          analytics: true,
          prioritySupport: true,
        },
        isActive: true,
      },
      {
        name: 'Enterprise Plan',
        description: 'Unlimited power',
        price: {
          [BillingCycle.MONTHLY]: 200,
          [BillingCycle.YEARLY]: 2000,
          [BillingCycle.ONE_TIME]: 5000,
        },
        tier: PlanTier.ENTERPRISE,
        features: {
          maxUsers: 1000,
          maxCourses: 500,
          maxStorageGB: 500,
          analytics: true,
          prioritySupport: true,
        },
        isActive: true,
      },
    ];

    for (const plan of plans) {
      await this.planModel.findOneAndUpdate({ tier: plan.tier }, plan, {
        upsert: true,
        new: true,
      });
    }
    console.log('Plans seeded successfully');
  }
}
