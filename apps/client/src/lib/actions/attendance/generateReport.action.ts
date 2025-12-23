'use server';

import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { getCookie } from '@/lib/utils/serverUtils';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';

export interface AttendanceReportDto {
  courseId: string;
  startDate?: Date;
  endDate?: Date;
  studentId?: string;
}

export async function generateAttendanceReport(dto: AttendanceReportDto) {
  try {
    const natsClient = await connectToNats();
    const idToken = await getCookie(AUTH_COOKIE_NAME);

    if (!idToken) throw new Error('No Token Provided');

    const response = await request<any>(
      natsClient,
      'attendance.generateReport',
      JSON.stringify({
        id: v7(),
        data: {
          authorization: idToken,
          dto: dto,
        },
      }),
    );

    if ('err' in response) {
      throw new Error(response.err.message);
    }

    return response;
  } catch (error: any) {
    console.error('error from generateAttendanceReport:', error);
    throw new Error(error.message || 'Failed to generate report');
  }
}

