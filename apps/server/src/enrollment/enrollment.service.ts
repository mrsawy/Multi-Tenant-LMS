import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';
import { CourseService } from 'src/course/course.service';
import { InjectModel } from '@nestjs/mongoose';
import { Enrollment } from './entities/enrollment.entity';
import { PaginateModel } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { AccessType } from './enum/accessType.enum';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { WalletService } from 'src/wallet/wallet.service';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { Course } from 'src/course/entities/course.entity';
import { Currency } from 'src/payment/enums/currency.enum';

@Injectable()
export class EnrollmentService {
  constructor(
    private readonly courseService: CourseService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    @InjectModel(Enrollment.name) private readonly enrollmentModel: PaginateModel<Enrollment>,

  ) { }



  async enrollUserToCourse(userId: string, courseId: string, accessType: AccessType = AccessType.SUBSCRIPTION, subscription?: SubscriptionTypeDef) {
    const course = await this.courseService.findOne(courseId);
    await this.userService.findOne(userId);

    if ((course.isPaid && !subscription) || (!course.isPaid && subscription)) {
      throw new Error(course.isPaid ? "Paid courses should have subscriptions" : "Unpaid courses should not have subscriptions");
    }
    const createdEnrollment = await this.enrollmentModel.create({
      userId, courseId, organizationId: course.organizationId, accessType, subscription,
    })
    if (course.isPaid && subscription?.billing.amount) {
      await this.walletService.credit({ userId: course.createdBy, transactionDto: { amount: subscription.billing.amount, currency: subscription.billing.currency } })
    }

    return createdEnrollment
  }

  async updateUserSubscription(userId: string, courseId: string, subscription: Partial<SubscriptionTypeDef>) {
    const enrollment = await this.enrollmentModel.findOne({ userId, courseId });
    const course = await this.courseService.findOne(courseId);
    if (!enrollment) throw new NotFoundException("Enrollment not found")
    if (enrollment.accessType !== AccessType.SUBSCRIPTION) {
      throw new BadRequestException('This enrollment is not a subscription type');
    }
    enrollment.subscription = { ...enrollment.subscription, ...subscription };

    const billingCycle = enrollment.subscription.billing.billingCycle;

    if (course.isPaid) {
      await this.walletService.credit(
        {
          userId: course.createdBy,
          transactionDto: {
            amount: (billingCycle == BillingCycle.MONTHLY ? course.pricing.MONTHLY?.priceUSD : course.pricing.YEARLY?.priceUSD) as number,
            currency: Currency.USD
          }
        })
    }

    await enrollment.save();
    return enrollment;
  }

}


