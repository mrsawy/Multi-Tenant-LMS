'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { MarkAttendanceInput, Attendance } from '@/lib/types/attendance/attendance.types';

export async function markAttendance(data: MarkAttendanceInput): Promise<Attendance> {
  try {
    const natsClient = await connectToNats();
    const idToken = await getCookie(AUTH_COOKIE_NAME);

    const response = await request(
      natsClient,
      'attendance.markAttendance',
      JSON.stringify({
        id: v7(),
        data: {
          authorization: idToken,
          dto: data,
        },
      })
    );
     
     // RE-CHECKING implementation plan:
     // I created `attendance.controller.message.ts` with manual handlers.
     // `markAttendance(@Payload() data: { dto: MarkAttendanceDto; markedBy: string })`
     // It expects `markedBy` in the payload.
     
     // BUT, who calls this? The Gateway? Or the Client directly via NATS? 
     // The "actions" here are Server Actions. They run on Next.js server.
     // They talk to NestJS server via NATS.
     // Usually, the NestJS Gateway (if existing) or the MessageController itself should verify token and extract user.
     
     // Let's pause writing this file and verify `attendance.controller.message.ts` vs `discussion.controller.message.ts`.
     
    if ('err' in (response as any)) {
      throw new Error((response as any as { err: NatsError }).err.message);
    }

    return response as Attendance;
  } catch (error: any) {
    console.error('error from markAttendance:', error);
    throw new Error(error.message || 'Failed to mark attendance');
  }
}
