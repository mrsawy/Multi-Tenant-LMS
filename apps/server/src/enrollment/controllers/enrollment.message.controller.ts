import {
  Controller,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import mongoose, { Connection, PaginateOptions } from 'mongoose';
import { AuthGuard } from 'src/auth/auth.guard';
import { InitiateSubscriptionDto } from '../dto/create-enrollment.dto';
import { SubscriptionType } from 'src/utils/enums/subscriptionType.enum';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import { InjectConnection } from '@nestjs/mongoose';
import { CourseService } from 'src/course/services/course.service';
import { SubscriptionStatus } from 'src/utils/enums/subscriptionStatus.enum';
import { Currency } from 'src/payment/enums/currency.enum';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import { EnrollmentService } from '../services/enrollment.service';
import { WalletService } from 'src/wallet/wallet.service';
import { Organization } from 'src/organization/entities/organization.entity';
import { Course } from 'src/course/entities/course.entity';
import { PaginateOptionsWithSearch } from 'src/utils/types/PaginateOptionsWithSearch';
import { handleRpcError } from 'src/utils/errorHandling';
import { UserService } from 'src/user/services/user.service';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { AccessType } from '../enum/accessType.enum';
import { Enrollment } from '../entities/enrollment.entity';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';
import { CreateEnrollmentHttpDto } from '../dto/create-enrollment.http.dto';
import { PaymentMethod } from '../enum/payment-method.enum';
import { PaymentOrchestratorService } from 'src/payment/services/payment-orchestrator.service';
import { PaymentPurpose } from 'src/payment/types/PaymentPurpose.interface';
import { SubmitQuizDto } from '../dto/quiz-submission.dto';
import { QuizService } from 'src/course/services/quiz.service';
import { ProjectService } from 'src/course/services/project.service';
import { LiveSessionService } from 'src/course/services/liveSession.service';
import { MarkLiveSessionAttendanceDto } from '../dto/live-session-attendance.dto';
import { SubmitProjectDto } from '../dto/project-submission.dto';
import { ApplyRpcErrorHandling } from 'src/utils/docerators/error-handeling/class/ApplyRpcErrorHandling.decorator';

@Controller()
@ApplyRpcErrorHandling
export class EnrollmentMessageController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly paymentService: PaymentOrchestratorService,
    private readonly userService: UserService,
    private readonly quizService: QuizService,
    private readonly projectService: ProjectService,
    private readonly liveSessionService: LiveSessionService,
  ) { }

  @UseGuards(AuthGuard)
  @MessagePattern('enrollment.getUserEnrollments')
  async getUserEnrollments(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe())
    payload: { options: PaginateOptionsWithSearch },
  ) {
    return await this.enrollmentService.getUserEnrollments(
      context.userPayload._id.toString(),
      payload.options,
    );
  }


  @UseGuards(AuthGuard)
  @MessagePattern('enrollment.getSingleEnrollment')
  async getSingleEnrollment(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe())
    payload: { enrollmentId: string },
  ) {
    return await this.enrollmentService.getSingleEnrollment(
      payload.enrollmentId,
      context.userPayload._id.toString(),
    );
  }


  @UseGuards(AuthGuard)
  @MessagePattern('enrollment.getOrganizationEnrollments')
  async getOrganizationEnrollments(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe())
    payload: { options: PaginateOptionsWithSearch },
  ) {
    return await this.enrollmentService.getOrganizationEnrollments(
      context.userPayload.organizationId.toString(),
      payload.options,
    );
  }

  @UseGuards(AuthGuard)
  @MessagePattern('enrollment.getCourseEnrollments')
  async getCourseEnrollments(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe())
    payload: { courseId: string; options: PaginateOptionsWithSearch },
  ) {
    // Optional: Validate if organization matches or if user has permission
    return await this.enrollmentService.getCourseEnrollments(
      payload.courseId,
      payload.options,
    );
  }

  @UseGuards(AuthGuard)
  @MessagePattern('enrollment.enrollToCourseByOrg')
  async enrollToCourseBgOrg(
    @Payload(new RpcValidationPipe())
    payload: { userId: string; courseId: string },
    @Ctx() context: IUserContext,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const { userId, courseId } = payload;

      const course = await this.courseService.findOne({
        _id: new mongoose.Types.ObjectId(courseId),
        organizationId: new mongoose.Types.ObjectId(
          context.userPayload.organizationId,
        ),
      });
      if (!course) throw new NotFoundException('Course not found');

      const user = await this.userService.findOne(userId);
      if (!user) throw new NotFoundException('user not found');

      const subscription = {
        status: SubscriptionStatus.ACTIVE,
        starts_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        billing: {
          amount: 0,
          currency: Currency.USD,
          billingCycle: BillingCycle.ONE_TIME,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phone,
        },
      };

      const enrollment = await this.enrollmentService.enrollUserToCourse(
        user._id.toString(),
        courseId,
        AccessType.BY_ORGANIZATION,
        subscription,
      );

      await session.commitTransaction();
      session.endSession();

      return enrollment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  //
  @UseGuards(AuthGuard)
  @MessagePattern('enrollment.enrollToFreeCourse')
  async enrollToFreeCourse(
    @Payload(new RpcValidationPipe())
    body: { courseId: string },
    @Ctx() context: IUserContext,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const enrollment = await this.enrollmentService.enrollUserToCourse(
        context.userPayload._id.toString(),
        body.courseId,
        AccessType.FREE,
      );

      await session.commitTransaction();
      session.endSession();

      return enrollment;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @MessagePattern('enrollment.enrollToCourse')
  async creditWalletSubscription(
    @Payload(new RpcValidationPipe())
    body: CreateEnrollmentHttpDto,
    @Ctx() context: IUserContext,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      if (body.paymentMethod == PaymentMethod.WALLET) {
        return await this.enrollmentService.enrollWithWallet(
          context.userPayload._id.toString(), body.courseId, body.billingCycle
        )
      } else {
        const { price: coursePrice, course } = await this.courseService.getCoursePrice({
          courseId: body.courseId,
          billingCycle: body.billingCycle!,
          currency: body.currency!
        })
        return await this.paymentService.createPaymentUrl({
          provider: body.provider,
          user: context.userPayload,
          amount: coursePrice,
          currency: body.currency,
          method: body.paymentMethod,
          purpose: PaymentPurpose.COURSE_PURCHASE,
          course,
          billingCycle: body.billingCycle
        })
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  //

  @UseGuards(AuthGuard)
  @MessagePattern('enrollment.getDetailedEnrolledCourse')
  async getDetailedEnrolledCourse(
    @Payload(new RpcValidationPipe())
    payload: { enrollmentId: string },
    @Ctx() context: IUserContext,
  ) {
    return await this.enrollmentService.getDetailedEnrolledCourse(
      payload.enrollmentId,
      context.userPayload._id.toString(),
    )
  }

  @UseGuards(AuthGuard)
  @MessagePattern('enrollment.toggleContentComplete')
  async toggleContentComplete(
    @Payload(new RpcValidationPipe())
    payload: { enrollmentId: string; contentId: string; completed: boolean },
    @Ctx() context: IUserContext,
  ) {
    return await this.enrollmentService.toggleContentComplete(
      payload.enrollmentId,
      context.userPayload._id.toString(),
      payload.contentId,
      payload.completed,
    );
  }

  @UseGuards(AuthGuard)
  @MessagePattern('enrollment.updateByOrg')
  async updateByOrg(
    @Payload(new RpcValidationPipe())
    payload: { enrollmentId: string; enrollmentData: Partial<Enrollment> },
    @Ctx() context: IUserContext,
  ) {
    return await this.enrollmentService.updateEnrollmentByOrg(
      {
        _id: new mongoose.Types.ObjectId(payload.enrollmentId),
        organizationId: new mongoose.Types.ObjectId(
          context.userPayload.organizationId,
        ),
      },
      payload.enrollmentData,
    );
  }


  @MessagePattern('enrollment.submitQuiz')
  @UseGuards(AuthGuard)
  async submitQuiz(
    @Payload(new RpcValidationPipe())
    payload: SubmitQuizDto,
    @Ctx() context: IUserContext,
  ) {
    payload.studentId = context.userPayload._id.toString();
    const result = await this.quizService.submitQuiz({
      ...payload,
      studentId: context.userPayload._id.toString(),
    });

    await this.enrollmentService.toggleContentComplete(
      payload.enrollmentId,
      payload.studentId,
      payload.quizId,
      true,
    );

    return {
      message: 'Quiz submitted successfully',
      result,
      success: true,
    }
  }


  @MessagePattern('enrollment.submitProject')
  @UseGuards(AuthGuard)
  async submitProject(
    @Payload(new RpcValidationPipe())
    payload: SubmitProjectDto,
    @Ctx() context: IUserContext,
  ) {
    payload.studentId = context.userPayload._id.toString();
    const result = await this.projectService.submitProject(payload);

    await this.enrollmentService.toggleContentComplete(
      payload.enrollmentId,
      payload.studentId,
      payload.projectId,
      true,
    );

    return {
      message: 'Project submitted successfully',
      result,
      success: true,
    };
  }


  @MessagePattern('enrollment.markLiveSessionAttendance')
  @UseGuards(AuthGuard)
  async markLiveSessionAttendance(
    @Payload(new RpcValidationPipe())
    payload: MarkLiveSessionAttendanceDto,
    @Ctx() context: IUserContext,
  ) {
    payload.studentId = context.userPayload._id.toString();
    const result = await this.liveSessionService.markAttendance(payload);

    await this.enrollmentService.toggleContentComplete(
      payload.enrollmentId,
      payload.studentId,
      payload.liveSessionId,
      true,
    );

    return {
      message: 'Attendance marked successfully',
      result,
      success: true,
    };
  }
}
