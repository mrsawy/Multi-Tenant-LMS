import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { CourseModule } from 'src/course/course.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Enrollment, EnrollmentSchema } from './entities/enrollment.entity';
import { UserModule } from 'src/user/user.module';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [CourseModule, UserModule, WalletModule, MongooseModule.forFeature([{ name: Enrollment.name, schema: EnrollmentSchema }])],
  controllers: [EnrollmentController],
  providers: [EnrollmentService],
  exports: [EnrollmentService]
})
export class EnrollmentModule { }
