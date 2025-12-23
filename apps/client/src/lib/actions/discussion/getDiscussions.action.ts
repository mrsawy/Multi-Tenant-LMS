'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { GetDiscussionsInput, DiscussionsResponse } from '@/lib/types/discussion/discussion.types';

export async function getDiscussions(data: GetDiscussionsInput): Promise<DiscussionsResponse> {
  try {
    const natsClient = await connectToNats();
    const idToken = await getCookie(AUTH_COOKIE_NAME);

    const payload = {
      type: data.type,
      entityId: data.entityId,
      moduleId: data.moduleId,
      contentId: data.contentId,
      parentId: data.parentId,
      page: data.page || 1,
      limit: data.limit || 20,
    };

    const response = await request(
      natsClient,
      'discussion.findAll',
      JSON.stringify({
        id: v7(),
        data: {
          authorization: idToken,
          ...payload,
        },
      })
    );

    if ('err' in (response as any)) {
      throw new Error((response as any as { err: NatsError }).err.message);
    }
    console.dir({ response }, { depth: null });

    return response as DiscussionsResponse;
  } catch (error: any) {
    console.error('error from getDiscussions:', error);
    throw new Error(error.message || 'Failed to fetch discussions');
  }
}
