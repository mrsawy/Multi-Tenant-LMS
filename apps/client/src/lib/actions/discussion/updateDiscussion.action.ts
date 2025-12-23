'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { UpdateDiscussionInput, IDiscussion } from '@/lib/types/discussion/discussion.types';

export async function updateDiscussion(
  discussionId: string,
  data: UpdateDiscussionInput
): Promise<IDiscussion> {
  try {
    const natsClient = await connectToNats();
    const idToken = await getCookie(AUTH_COOKIE_NAME);

    const payload = {
      id: discussionId,
      updateDiscussionDto: {
        content: data.content,
      },
    };

    const response = await request(
      natsClient,
      'discussion.update',
      JSON.stringify({
        id: v7(),
        data: {
          authorization: idToken,
          ...payload,
        },
      })
    );

    if ('err' in (response as any)) {
      throw new Error(((response as any) as { err: NatsError }).err.message);
    }

    return response as IDiscussion;
  } catch (error: any) {
    console.error('error from updateDiscussion:', error);
    throw new Error(error.message || 'Failed to update discussion');
  }
}
