import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  Post,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { CreateEnrollmentHttpDto } from '../dto/create-enrollment.http.dto';
import { PaymentMethod } from '../enum/payment-method.enum';

import { EnrollmentService } from '../services/enrollment.service';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginateOptionsWithSearch } from 'src/utils/types/PaginateOptionsWithSearch';
import { PaymentOrchestratorService } from 'src/payment/services/payment-orchestrator.service';
import { CourseService } from 'src/course/services/course.service';
import { PaymentPurpose } from 'src/payment/types/PaymentPurpose.interface';
import { SubmitQuizDto } from '../dto/quiz-submission.dto';
import { QuizService } from 'src/course/services/quiz.service';

@Controller('enrollment')
export class EnrollmentHttpController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly paymentService: PaymentOrchestratorService,
    private readonly courseService: CourseService,
    private readonly quizService: QuizService,
  ) { }

  @UseGuards(AuthGuard)
  @Post('/')
  async createEnrollmentFree(
    @Request() req: IUserRequest,
    @Body() body: CreateEnrollmentHttpDto,
  ) {
    if (body.paymentMethod = PaymentMethod.WALLET) {
      return await this.enrollmentService.enrollWithWallet(
        req.user._id.toString(), body.courseId, body.billingCycle
      )
    } else {
      const { price: coursePrice, course } = await this.courseService.getCoursePrice({
        courseId: body.courseId,
        billingCycle: body.billingCycle!,
        currency: body.currency!
      })
      return await this.paymentService.createPaymentUrl({
        provider: body.provider,
        user: req.user,
        amount: coursePrice,
        currency: body.currency,
        method: body.paymentMethod,
        purpose: PaymentPurpose.COURSE_PURCHASE,
        course,
        billingCycle: body.billingCycle
      })
    }

  }

  @UseGuards(AuthGuard)
  @Get()
  async getUserEnrollments(
    @Request() req: IUserRequest,
    @Query() options: PaginateOptionsWithSearch,
  ) {
    return await this.enrollmentService.getUserEnrollments(
      req.user._id.toString(),
      options,
    );
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async getDetailedEnrolledCourse(
    @Request() req: IUserRequest,
    @Param('id') id: string,
  ) {
    return await this.enrollmentService.getDetailedEnrolledCourse(
      id,
      req.user._id.toString(),
    );
  }

  @UseGuards(AuthGuard)
  @Patch('/toggle-content-complete')
  async toggleContentComplete(
    @Request() req: IUserRequest,
    @Body()
    body: { enrollmentId: string; contentId: string; completed: boolean },
  ) {
    return await this.enrollmentService.toggleContentComplete(
      body.enrollmentId,
      req.user._id.toString(),
      body.contentId,
      body.completed,
    );
  }


  @UseGuards(AuthGuard)
  @Put('/content/submit-quiz')
  async submitQuiz(
    @Body() payload: SubmitQuizDto,
    @Request() req: IUserRequest,
  ) {

    const result = await this.quizService.submitQuiz({
      ...payload,
      studentId: req.user._id.toString(),
    });

    await this.enrollmentService.toggleContentComplete(
      payload.enrollmentId,
      req.user._id.toString(),
      payload.quizId,
      true,
    );

    return {
      message: 'Quiz submitted successfully',
      result,
      success: true,
    };

  }
}
