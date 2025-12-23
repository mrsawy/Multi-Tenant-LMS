export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export interface Attendance {
  _id: string;
  date: string;
  courseId: string;
  studentId: string | { _id: string; firstName: string; lastName: string; email: string; avatar?: string };
  organizationId: string;
  status: AttendanceStatus;
  notes?: string;
  markedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MarkAttendanceInput {
  date: Date;
  courseId: string;
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface BulkMarkAttendanceInput {
  date: Date;
  courseId: string;
  students: {
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
}

export interface GetAttendanceByDateInput {
  courseId: string;
  date: string;
}

export interface GetStudentAttendanceInput {
  studentId: string;
  courseId: string;
}

export interface AttendanceResponse {
  data: Attendance[];
  message?: string;
}

export interface SingleAttendanceResponse {
  data: Attendance;
  message?: string;
}
