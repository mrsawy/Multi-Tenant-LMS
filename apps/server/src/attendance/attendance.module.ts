import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './entities/attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceMessageController } from './attendance.controller.message';
import { CourseModule } from '../course/course.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { UserModule } from '../user/user.module';
import { AttendanceController } from './attendance.controller.http';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
    CourseModule,
    EnrollmentModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AttendanceController, AttendanceMessageController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
