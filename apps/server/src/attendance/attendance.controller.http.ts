import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { AttendanceReportDto } from './dto/attendance-report.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserDocument } from '../user/entities/user.entity';
import { AuthGuard } from '../auth/auth.guard';

@Controller('attendance')
@UseGuards(AuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  markAttendance(@Body() dto: MarkAttendanceDto, @CurrentUser() user: UserDocument) {
    // Permission check could be more granular here (e.g. is user instructor/admin)
    return this.attendanceService.markAttendance(dto, user._id.toString());
  }

  @Post('bulk-mark')
  bulkMarkAttendance(
    @Body() dto: BulkMarkAttendanceDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.attendanceService.bulkMarkAttendance(dto, user._id.toString());
  }

  @Get('course/:courseId')
  getAttendanceByDate(
    @Param('courseId') courseId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getAttendanceByDate(courseId, new Date(date));
  }

  @Get('student/:studentId')
  getStudentAttendance(
    @Param('studentId') studentId: string,
    @Query('courseId') courseId: string,
  ) {
    return this.attendanceService.getStudentAttendance(studentId, courseId);
  }

   @Get('course-history/:courseId')
  getCourseAttendance(
    @Param('courseId') courseId: string,
  ) {
    return this.attendanceService.getCourseAttendance(courseId);
  }

  @Get('reports')
  generateReport(@Query() dto: AttendanceReportDto) {
    return this.attendanceService.generateReport(dto);
  }
}
