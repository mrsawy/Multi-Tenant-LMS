import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, Types } from 'mongoose';
import { Attendance } from './entities/attendance.entity';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { BulkMarkAttendanceDto } from './dto/bulk-mark-attendance.dto';
import { AttendanceReportDto } from './dto/attendance-report.dto';
import { AttendanceStatus } from './enum/attendance-status.enum';
import { EnrollmentService } from '../enrollment/services/enrollment.service';
import { CourseService } from '../course/services/course.service';
import { Enrollment } from '../enrollment/entities/enrollment.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private readonly attendanceModel: PaginateModel<Attendance>,
    private readonly enrollmentService: EnrollmentService,
    private readonly courseService: CourseService,
  ) { }

  async markAttendance(dto: MarkAttendanceDto, markedBy: string) {
    // Validate course exists
    const course = await this.courseService.findOneById(dto.courseId);
    if (!course) throw new NotFoundException('Course not found');

    // Validate enrollment
    const enrollment = await this.enrollmentService.getSingleEnrollmentWithoutCheck(
      dto.studentId,
      dto.courseId,
    );
    if (!enrollment) {
      throw new BadRequestException('Student is not enrolled in this course');
    }

    // Check for duplicate for the same date/course/student
    // We assume one attendance record per day per course
    const startOfDay = new Date(dto.date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dto.date);
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await this.attendanceModel.findOne({
      courseId: dto.courseId,
      studentId: dto.studentId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (attendance) {
      // Update existing
      attendance.status = dto.status;
      if (dto.notes) attendance.notes = dto.notes;
      attendance.markedBy = new Types.ObjectId(markedBy);
      await attendance.save();
    } else {
      // Create new
      attendance = await this.attendanceModel.create({
        ...dto,
        organizationId: course.organizationId,
        markedBy: new Types.ObjectId(markedBy),
      });
    }

    // Update enrollment summary
    await this.updateEnrollmentAttendanceSummary(
      enrollment,
      dto.studentId,
      dto.courseId,
    );

    return attendance;
  }

  async bulkMarkAttendance(dto: BulkMarkAttendanceDto, markedBy: string) {
    const results: { studentId: string; status: string; data?: any; message?: string }[] = [];
    for (const studentStatus of dto.students) {
      try {
        const result = await this.markAttendance(
          {
            date: dto.date,
            courseId: dto.courseId,
            studentId: studentStatus.studentId,
            status: studentStatus.status,
            notes: studentStatus.notes,
          },
          markedBy,
        );
        results.push({ studentId: studentStatus.studentId, status: 'success', data: result });
      } catch (error) {
        results.push({
          studentId: studentStatus.studentId,
          status: 'error',
          message: error.message,
        });
      }
    }
    return results;
  }

  async getAttendanceByDate(courseId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.attendanceModel
      .find({
        courseId: new Types.ObjectId(courseId),
        date: { $gte: startOfDay, $lte: endOfDay },
      })
      .populate('studentId', 'firstName lastName email avatar');
  }

  async getStudentAttendance(studentId: string, courseId: string) {
    return this.attendanceModel
      .find({
        studentId: new Types.ObjectId(studentId),
        courseId: new Types.ObjectId(courseId),
      })
      .sort({ date: -1 });
  }

  async getCourseAttendance(courseId: string) {
    return this.attendanceModel
      .find({
        courseId: new Types.ObjectId(courseId),
      })
      .sort({ date: -1 })
      .populate('studentId', 'firstName lastName');
  }

  async generateReport(dto: AttendanceReportDto) {
    const query: any = {};
    if (dto.courseId) query.courseId = new Types.ObjectId(dto.courseId);
    if (dto.studentId) query.studentId = new Types.ObjectId(dto.studentId);

    if (dto.startDate || dto.endDate) {
      query.date = {};
      if (dto.startDate) query.date.$gte = new Date(dto.startDate);
      if (dto.endDate) query.date.$lte = new Date(dto.endDate);
    }

    // Get all attendance records
    const attendanceRecords = await this.attendanceModel
      .find(query)
      .populate('studentId', 'firstName lastName email avatar')
      .sort({ date: 1 });

    // Aggregate data by student
    const studentMap = new Map<string, any>();
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalExcused = 0;

    attendanceRecords.forEach((record: any) => {
      let studentId: string;
      let studentInfo: any = null;

      if (typeof record.studentId === 'object' && record.studentId !== null && '_id' in record.studentId) {
        // studentId is populated
        studentId = record.studentId._id.toString();
        studentInfo = record.studentId;
      } else {
        // studentId is just an ObjectId
        studentId = (record.studentId as any).toString();
      }

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId,
          firstName: studentInfo?.firstName || '',
          lastName: studentInfo?.lastName || '',
          email: studentInfo?.email || '',
          avatar: studentInfo?.avatar,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          excusedCount: 0,
          totalClasses: 0,
        });
      }

      const studentData = studentMap.get(studentId);
      // Increment total for EVERY attendance record (regardless of status)
      studentData.totalClasses++;

      // Count by status
      switch (record.status) {
        case AttendanceStatus.PRESENT:
          studentData.presentCount++;
          totalPresent++;
          break;
        case AttendanceStatus.ABSENT:
          studentData.absentCount++;
          totalAbsent++;
          break;
        case AttendanceStatus.LATE:
          studentData.lateCount++;
          totalLate++;
          break;
        case AttendanceStatus.EXCUSED:
          studentData.excusedCount++;
          totalExcused++;
          break;
      }
    });

    // Calculate attendance rate for each student
    const students = Array.from(studentMap.values()).map((student) => {
      // Attendance rate calculation:
      // - Numerator: Count of records where student was Present OR Late (actually attended)
      // - Denominator: Total records (all attendance marks including Present, Late, Absent, Excused)
      // - Formula: (Present + Late) / Total Records * 100
      const attendedClasses = student.presentCount + student.lateCount;
      const attendanceRate = student.totalClasses > 0
        ? (attendedClasses / student.totalClasses) * 100
        : 0;

      return {
        ...student,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
      };
    });

    // Sort students by attendance rate (descending)
    students.sort((a, b) => b.attendanceRate - a.attendanceRate);

    return {
      summary: {
        totalPresent,
        totalAbsent,
        totalLate,
        totalExcused,
        totalRecords: attendanceRecords.length,
        totalStudents: students.length,
      },
      students,
    };
  }

  private async updateEnrollmentAttendanceSummary(
    enrollment: any,
    studentId: string,
    courseId: string,
  ) {
    // Calculate stats
    const allRecords = await this.attendanceModel.find({
      studentId: new Types.ObjectId(studentId),
      courseId: new Types.ObjectId(courseId),
    });

    const totalClasses = allRecords.length;
    const attended = allRecords.filter(
      (r) => r.status === AttendanceStatus.PRESENT,
    ).length;
    const absent = allRecords.filter(
      (r) => r.status === AttendanceStatus.ABSENT,
    ).length;
    const late = allRecords.filter(
      (r) => r.status === AttendanceStatus.LATE,
    ).length;
    const excused = allRecords.filter(
      (r) => r.status === AttendanceStatus.EXCUSED,
    ).length;

    // Determine percentage logic - usually Present + Late counts as "Present" for simple calc, or weighted.
    // For now: (Attended + Late) / Total * 100
    const effectiveAttended = attended + late;
    // Or strictly attended? User didn't specify formula. Let's assume standard:
    // (Present + Late) / Total

    const percentage = totalClasses > 0 ? (effectiveAttended / totalClasses) * 100 : 0;

    const summary = {
      totalClasses,
      attended,
      absent,
      late,
      excused,
      percentage: Math.round(percentage * 100) / 100,
    };

    // Call enrollment service to update
    // Note: We need to expose a method in EnrollmentService for this or use updateEnrollmentByOrg
    // But updateEnrollmentByOrg expects filters.
    // Let's create a dedicated internal method in EnrollmentService or use updateOne directly if we were in that module.
    // Since we are in AttendanceModule, we should use the service method.

    await this.enrollmentService.updateAttendanceSummary(enrollment._id, summary);
  }
}
