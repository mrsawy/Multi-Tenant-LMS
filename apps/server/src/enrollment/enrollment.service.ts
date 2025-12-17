import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';
import { CourseService } from 'src/course/services/course.service';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Enrollment } from './entities/enrollment.entity';
import mongoose, { Connection, mongo, PaginateModel } from 'mongoose';
import { UserService } from 'src/user/user.service';
import { AccessType } from './enum/accessType.enum';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { WalletService } from 'src/wallet/wallet.service';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { Course } from 'src/course/entities/course.entity';
import { CourseModuleEntity } from 'src/course/entities/course-module.entity';
import { Currency } from 'src/payment/enums/currency.enum';
import { PaginateOptionsWithSearch } from 'src/utils/types/PaginateOptionsWithSearch';
import { Types } from 'mongoose';
import { SubscriptionType } from 'src/utils/enums/subscriptionType.enum';
import { SubscriptionStatus } from 'src/utils/enums/subscriptionStatus.enum';
import { Organization } from 'src/organization/entities/organization.entity';
import { PaymentOrchestratorService } from 'src/payment/services/payment-orchestrator.service';
import { PaymentProvider, PaymentPurpose } from 'src/payment/strategies/interfaces/payment-strategy.interface';
import { PaymentMethod as PaymentMethodEnum } from 'src/payment/types/paymentMethod.interface';
import { CurrencyService } from 'src/currency/currency.service';
import { PaymentMethod } from './enum/payment-method.enum';
import { CourseContent } from 'src/course/entities/course-content.entity';



@Injectable()
export class EnrollmentService {
  constructor(
    private readonly courseService: CourseService,
    private readonly userService: UserService,
    private readonly walletService: WalletService,
    @InjectModel(Enrollment.name)
    private readonly enrollmentModel: PaginateModel<Enrollment>,
    @InjectModel(Course.name)
    private readonly courseModel: PaginateModel<Course>,
    @InjectConnection() private readonly connection: Connection,
    private readonly currencyService: CurrencyService,
  ) { }
  async enrollUserToCourse(
    userId: string,
    courseId: string,
    accessType: AccessType = AccessType.SUBSCRIPTION,
    subscription?: SubscriptionTypeDef,
  ) {
    const course = await this.courseService.findOneById(courseId);
    const createdEnrollment = await this.enrollmentModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      courseId: new mongoose.Types.ObjectId(courseId),
      organizationId: course.organizationId,
      accessType,
      subscription,
    });

    await this.courseModel.updateOne(
      { _id: new mongoose.Types.ObjectId(courseId) },
      { $inc: { 'stats.totalEnrollments': 1 } },
    );

    return createdEnrollment;
  }

  async getUserEnrollments(userId: string, options: PaginateOptionsWithSearch) {
    return await this.enrollmentModel.paginate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        ...options,
        populate: {
          path: 'course',
          populate: [
            { path: 'categories' },
            { path: 'instructor', select: 'firstName lastName email phone' },
          ],
        },
      },
    );
  }

  async getOrganizationEnrollments(
    organizationId: string,
    options: PaginateOptionsWithSearch,
  ) {
    return await this.enrollmentModel.paginate(
      { organizationId: new mongoose.Types.ObjectId(organizationId) },
      {
        ...options,
        populate: [
          {
            path: 'course',
            populate: {
              path: 'categories',
            },
          },
          {
            path: 'user',
          },
        ],
      },
    );
  }

  async updateUserSubscription(
    userId: string,
    courseId: string,
    subscription: Partial<SubscriptionTypeDef>,
  ) {
    const enrollment = await this.enrollmentModel.findOne({ userId, courseId });
    const course = await this.courseService.findOneById(courseId);
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.accessType !== AccessType.SUBSCRIPTION) {
      throw new BadRequestException(
        'This enrollment is not a subscription type',
      );
    }
    enrollment.subscription = { ...enrollment.subscription, ...subscription };
    const billingCycle = enrollment.subscription.billing.billingCycle;
    if (course.isPaid) {
      await this.walletService.credit({
        userId: course.createdBy,
        transactionDto: {
          amount: (billingCycle == BillingCycle.MONTHLY
            ? course.pricing.MONTHLY?.priceUSD
            : course.pricing.YEARLY?.priceUSD) as number,
          currency: Currency.USD,
        },
      });
    }
    await enrollment.save();
    return enrollment;
  }

  async getSingleEnrollment(enrollmentId: string, userId: string) {
    const enrollment = await this.enrollmentModel.findOne({
      _id: new mongoose.Types.ObjectId(enrollmentId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  async getDetailedEnrolledCourse(enrollmentId: string, userId: string) {
    const enrollment = await this.enrollmentModel.findOne({
      _id: new mongoose.Types.ObjectId(enrollmentId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    const course =
      await this.courseService.getCourseWithOrderedModulesAndContents(
        enrollment.courseId.toString(),
      );
    return { data: { course, enrollment }, message: 'Course Retrieved' };
  }

  async toggleContentComplete(
    enrollmentId: string,
    userId: string,
    contentId: string,
    completed: boolean,
  ) {
    const enrollment = await this.enrollmentModel.findOne({
      _id: new mongoose.Types.ObjectId(enrollmentId),
      userId: new mongoose.Types.ObjectId(userId),
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    const course =
      await this.courseService.getCourseWithOrderedModulesAndContents(
        enrollment.courseId.toString(),
      );
    if (!course) throw new NotFoundException('Course not found');
    // Find the module that contains this content
    let targetModule: any = null;
    let allContentIds: string[] = [];
    for (const module of course.modules) {
      const moduleContentIds = module.contents.map((content) =>
        (content as CourseContent)._id.toString(),
      );
      if (moduleContentIds.includes(contentId)) {
        targetModule = module;
        allContentIds = moduleContentIds;
        break;
      }
    }
    if (!targetModule) {
      throw new NotFoundException('Content not found in any module');
    }
    if (!enrollment.progress) {
      enrollment.progress = {
        completedModules: [],
        completedContents: [],
        completedCourses: [],
      };
    }
    // Toggle content completion
    const contentIndex = enrollment.progress.completedContents.findIndex(
      (id) => id.toString() === contentId,
    );
    if (completed) {
      // Add content if not already completed
      if (contentIndex === -1) {
        enrollment.progress.completedContents.push(
          new mongoose.Types.ObjectId(contentId),
        );
      }
    } else {
      // Remove content if it exists
      if (contentIndex !== -1) {
        enrollment.progress.completedContents.splice(contentIndex, 1);
      }
    }
    // Calculate module completion
    const completedContentsInModule = allContentIds.filter((id) =>
      enrollment.progress.completedContents.some(
        (completedId) => completedId.toString() === id,
      ),
    );
    const moduleId = targetModule._id.toString();
    const moduleIndex = enrollment.progress.completedModules.findIndex(
      (id) => id.toString() === moduleId,
    );
    // If all contents in module are completed, mark module as complete
    if (
      completedContentsInModule.length === allContentIds.length &&
      allContentIds.length > 0
    ) {
      if (moduleIndex === -1) {
        enrollment.progress.completedModules.push(
          new mongoose.Types.ObjectId(moduleId),
        );
      }
    } else {
      // If not all contents are completed, remove module from completed
      if (moduleIndex !== -1) {
        enrollment.progress.completedModules.splice(moduleIndex, 1);
      }
    }
    // Calculate course completion
    const allModuleIds = course.modules.map((module: any) =>
      (module as CourseModuleEntity & { _id: mongoose.Types.ObjectId })._id.toString(),
    );
    const completedModulesInCourse = allModuleIds.filter((id) =>
      enrollment.progress.completedModules.some(
        (completedId) => completedId.toString() === id,
      ),
    );
    const courseId = enrollment.courseId.toString();
    const courseIndex = enrollment.progress.completedCourses.findIndex(
      (id) => id.toString() === courseId,
    );
    // If all modules in course are completed, mark course as complete
    if (
      completedModulesInCourse.length === allModuleIds.length &&
      allModuleIds.length > 0
    ) {
      if (courseIndex === -1) {
        enrollment.progress.completedCourses.push(
          new mongoose.Types.ObjectId(courseId),
        );
        // Set completedAt timestamp when course is completed
        enrollment.completedAt = new Date();
      }
    } else {
      // If not all modules are completed, remove course from completed
      if (courseIndex !== -1) {
        enrollment.progress.completedCourses.splice(courseIndex, 1);
        // Clear completedAt timestamp when course is uncompleted
        // enrollment.completedAt = undefined;
      }
    }
    // Calculate progress percentage
    const allContents = course.modules.flatMap((module) => module.contents);
    enrollment.progressPercentage =
      allContents.length > 0
        ? (enrollment.progress.completedContents.length / allContents.length) *
        100
        : 0;

    await enrollment.save();

    return {
      message: 'Content completion toggled successfully',
      isCourseCompleted:
        courseIndex !== -1 ||
        (completedModulesInCourse.length === allModuleIds.length &&
          allModuleIds.length > 0),
      completedModules: enrollment.progress.completedModules.length,
      totalModules: allModuleIds.length,
    };
  }
  async updateEnrollmentByOrg(
    filters: mongoose.RootFilterQuery<Enrollment>,
    enrollmentData: Partial<Enrollment>,
  ) {
    const update: any = {};
    // If subscription is being updated, merge nested fields instead of replacing
    if (enrollmentData.subscription) {
      for (const key in enrollmentData.subscription) {
        update[`subscription.${key}`] = enrollmentData.subscription[key];
      }
    }
    // Include other top-level fields
    for (const key in enrollmentData) {
      if (key !== 'subscription') {
        update[key] = enrollmentData[key];
      }
    }
    const enrollment = await this.enrollmentModel.findOneAndUpdate(
      filters,
      { $set: update },
      { new: true },
    );
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  calculateEndDate(billingCycle: BillingCycle): string | undefined {
    const now = new Date();
    switch (billingCycle) {
      case BillingCycle.MONTHLY:
        now.setMonth(now.getMonth() + 1);
        break;
      case BillingCycle.YEARLY:
        now.setFullYear(now.getFullYear() + 1);
        break;
      case BillingCycle.ONE_TIME:
        return;
    }
    return now.toISOString();
  }

  async enrollWithWallet(
    userId: string,
    courseId: string,
    billingCycle: BillingCycle = BillingCycle.ONE_TIME,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {


      const user = await this.userService.findOne(userId)
      const walletCurrency = await this.walletService.getWalletCurrency(user.walletId.toString())
      const { price: priceUSD, course } = await this.courseService.getCoursePrice({
        courseId: courseId, billingCycle, currency: Currency.USD
      })

      let accessType: AccessType = AccessType.SUBSCRIPTION;
      !course.isPaid && (accessType = AccessType.FREE);
      billingCycle == BillingCycle.ONE_TIME &&
        (accessType = AccessType.PAID_ONCE);

      const subscription: SubscriptionTypeDef = {
        status: SubscriptionStatus.ACTIVE,
        starts_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ends_at: this.calculateEndDate(billingCycle),
        billing: {
          amount: this.currencyService.convertFromUSD(priceUSD, walletCurrency),
          currency: walletCurrency,
          billingCycle: billingCycle,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phone,
        },
      };

      const enrollment = await this.enrollUserToCourse(
        user._id.toString(),
        courseId,
        accessType,
        subscription,
      );

      if (course.isPaid && priceUSD > 0) {
        await this.walletService.debit({
          userId: user._id.toString(),
          purpose: PaymentPurpose.COURSE_PURCHASE,
          paymentMethod: PaymentMethod.WALLET,
          transactionDto: {
            amount: priceUSD,
            currency: Currency.USD,
            description: `Enrollment in course ${course.name}`,
          },
          session,
        });

        const populatedCourse = await course.populate<{
          organization: Organization;
        }>('organization');

        await this.walletService.credit({
          userId: populatedCourse.organization.superAdminId.toString(),
          transactionDto: {
            amount: priceUSD,
            currency: Currency.USD,
            description: `Enrollment revenue for course ${course.name}`,
          },
          session,
        });
      }

      await session.commitTransaction();
      return enrollment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }


}
