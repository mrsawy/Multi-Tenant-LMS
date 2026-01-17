import { forwardRef, Module } from '@nestjs/common';
import { EnrollmentService } from './services/enrollment.service';
import { EnrollmentHttpController } from './controllers/enrollment.http.controller';
import { CourseModule } from 'src/course/course.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, EnrollmentSchema } from './entities/enrollment.entity';
import { Course, CourseSchema } from 'src/course/entities/course.entity';
import { UserModule } from 'src/user/user.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { EnrollmentMessageController } from './controllers/enrollment.message.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PaymentModule } from 'src/payment/payment.module';
import { CurrencyModule } from 'src/currency/currency.module';


@Module({
  imports: [

    MongooseModule.forFeature([
      { name: Enrollment.name, schema: EnrollmentSchema },
      { name: Course.name, schema: CourseSchema },
    ]),


    forwardRef(() => WalletModule),

    forwardRef(() => CourseModule),
    UserModule,
    CurrencyModule,
    PaymentModule,
    AuthModule,

  ],

  controllers: [EnrollmentHttpController, EnrollmentMessageController],
  providers: [EnrollmentService],
  exports: [EnrollmentService],
})
export class EnrollmentModule { }
