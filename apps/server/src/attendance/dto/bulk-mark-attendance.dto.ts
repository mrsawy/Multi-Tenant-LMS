import { Type } from 'class-transformer';
import { IsArray, IsDate, IsMongoId, IsNotEmpty, ValidateNested } from 'class-validator';
import { MarkAttendanceDto } from './mark-attendance.dto';

// Since we want to mark multiple students for the same day/course potentially,
// or just a raw list of student statuses.
// Let's structure it as a list of simple objects, or a wrapper.
// The user request suggested: "Mark entire class at once".
// Usually this means sending a list of { monitorId, status } for a specific date and course.

export class StudentAttendanceStatus {
  @IsNotEmpty()
  @IsMongoId()
  studentId: string;

  @IsNotEmpty()
  status: any; // Using any here to rely on the service validation or improved typing if we import enum, 
               // but best to use the enum if possible. Importing...
}

// But reusing MarkAttendanceDto logic or similar structure is better.
// Let's create a specific DTO for the bulk operation payload.

import { AttendanceStatus } from '../enum/attendance-status.enum';
import { IsEnum, IsOptional } from 'class-validator';

export class StudentStatusDto {
  @IsNotEmpty()
  @IsMongoId()
  studentId: string;

  @IsNotEmpty()
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  notes?: string;
}

export class BulkMarkAttendanceDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @IsMongoId()
  courseId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentStatusDto)
  students: StudentStatusDto[];
}
