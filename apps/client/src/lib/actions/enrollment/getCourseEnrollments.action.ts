'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { PaginationOptions, withDefaults } from '@/lib/types/Paginated';

export async function getCourseEnrollments(courseId: string, options: PaginationOptions) {
  try {
    const natsClient = await connectToNats();
    const idToken = await getCookie(AUTH_COOKIE_NAME);
    const opts = withDefaults(options);

    const response = await request(
      natsClient,
      'enrollment.getCourseEnrollments',
      JSON.stringify({
        id: v7(),
        data: {
          authorization: idToken,
          courseId,
          options: opts,
        },
      })
    );

    if ('err' in (response as any)) {
      throw new Error((response as any as { err: NatsError }).err.message);
    }

    return response;
  } catch (error: any) {
    console.error('error from getCourseEnrollments:', error);
    throw new Error(error.message || 'Failed to fetch course enrollments');
  }
}
