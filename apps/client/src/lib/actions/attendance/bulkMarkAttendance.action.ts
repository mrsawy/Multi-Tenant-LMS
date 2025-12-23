'use server';

import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { getCookie } from '@/lib/utils/serverUtils';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { AttendanceStatus } from '@/lib/types/attendance/attendance.types';

export interface BulkAttendanceDto {
  courseId: string;
  date: Date;
  attendanceRecords: {
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
}

export async function bulkMarkAttendance(dto: BulkAttendanceDto) {
  try {
    const natsClient = await connectToNats();
    const idToken = await getCookie(AUTH_COOKIE_NAME);

    if (!idToken) throw new Error('No Token Provided');

    // Transform the DTO to match backend expectations
    const backendDto = {
      courseId: dto.courseId,
      date: dto.date,
      students: dto.attendanceRecords, // Backend expects 'students' not 'attendanceRecords'
    };

    const response = await request<any>(
      natsClient,
      'attendance.bulkMarkAttendance',
      JSON.stringify({
        id: v7(),
        data: {
          authorization: idToken,
          dto: backendDto,
        },
      }),
    );

    if ('err' in response) {
      throw new Error(response.err.message);
    }

    return response;
  } catch (error: any) {
    console.error('error from bulkMarkAttendance:', error);
    throw new Error(error.message || 'Failed to mark attendance');
  }
}

