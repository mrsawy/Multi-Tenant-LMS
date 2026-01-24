'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { PaginationOptions, withDefaults } from '@/lib/types/Paginated';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';

export async function getCourseEnrollments(courseId: string, options: PaginationOptions) {
  // auth - failed

  return await createAuthorizedNatsRequest('enrollment.getCourseEnrollments', {
    courseId,
    options: withDefaults<PaginationOptions>(options),
  });
}
