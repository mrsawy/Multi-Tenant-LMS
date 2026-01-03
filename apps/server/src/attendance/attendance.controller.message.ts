import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload, Ctx } from '@nestjs/microservices';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { AttendanceReportDto } from './dto/attendance-report.dto';
import { AuthGuard } from '../auth/auth.guard';
import { IUserContext } from '../utils/types/IUserContext.interface';

@Controller()
export class AttendanceMessageController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @UseGuards(AuthGuard)
  @MessagePattern('attendance.markAttendance')
  markAttendance(
    @Payload() data: { dto: MarkAttendanceDto },
    @Ctx() context: IUserContext,
  ) {
    return this.attendanceService.markAttendance(
      data.dto,
      context.userPayload._id.toString(),
    );
  }

  @UseGuards(AuthGuard)
  @MessagePattern('attendance.bulkMarkAttendance')
  bulkMarkAttendance(
    @Payload() data: { dto: BulkMarkAttendanceDto },
    @Ctx() context: IUserContext,
  ) {
    return this.attendanceService.bulkMarkAttendance(
      data.dto,
      context.userPayload._id.toString(),
    );
  }

  @UseGuards(AuthGuard)
  @MessagePattern('attendance.getByStudent')
  getByStudent(
    @Payload() data: { studentId: string; courseId: string },
    @Ctx() context: IUserContext,
  ) {
    // Optional: Check if user is allowed to view this student's attendance
    return this.attendanceService.getStudentAttendance(
      data.studentId,
      data.courseId,
    );
  }

  @UseGuards(AuthGuard)
  @MessagePattern('attendance.getByCourse')
  getByCourse(
    @Payload() data: { courseId: string; date: Date },
    @Ctx() context: IUserContext,
  ) {
    return this.attendanceService.getAttendanceByDate(data.courseId, data.date);
  }

  @UseGuards(AuthGuard)
  @MessagePattern('attendance.generateReport')
  generateReport(
    @Payload() data: { dto: AttendanceReportDto },
    @Ctx() context: IUserContext,
  ) {
    return this.attendanceService.generateReport(data.dto);
  }
}
