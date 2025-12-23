'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { GetAttendanceByDateInput, Attendance, GetStudentAttendanceInput } from '@/lib/types/attendance/attendance.types';

export async function getAttendanceByDate(data: GetAttendanceByDateInput): Promise<Attendance[]> {
  try {
    const natsClient = await connectToNats();
    const idToken = await getCookie(AUTH_COOKIE_NAME);

    const response = await request(
      natsClient,
      'attendance.getByCourse',
      JSON.stringify({
        id: v7(),
        data: {
          authorization: idToken,
          courseId: data.courseId,
          date: data.date,
        },
      })
    );

    if ('err' in (response as any)) {
      throw new Error((response as any as { err: NatsError }).err.message);
    }

    return response as Attendance[];
  } catch (error: any) {
    console.error('error from getAttendanceByDate:', error);
    throw new Error(error.message || 'Failed to fetch attendance');
  }
}

export async function getStudentAttendance(data: GetStudentAttendanceInput): Promise<Attendance[]> {
  try {
    const natsClient = await connectToNats();
    const idToken = await getCookie(AUTH_COOKIE_NAME);

    const response = await request(
      natsClient,
      'attendance.getByStudent',
      JSON.stringify({
        id: v7(),
        data: {
          authorization: idToken,
          studentId: data.studentId,
          courseId: data.courseId,
        },
      })
    );

    if ('err' in (response as any)) {
      throw new Error((response as any as { err: NatsError }).err.message);
    }

    return response as Attendance[];
  } catch (error: any) {
    console.error('error from getStudentAttendance:', error);
    throw new Error(error.message || 'Failed to fetch student attendance');
  }
}
