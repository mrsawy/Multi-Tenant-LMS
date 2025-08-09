import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PlanModule } from 'src/plan/plan.module';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [PlanModule, CourseModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule { }
