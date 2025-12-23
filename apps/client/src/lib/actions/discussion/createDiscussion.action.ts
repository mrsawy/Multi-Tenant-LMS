'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { CreateDiscussionInput, IDiscussion } from '@/lib/types/discussion/discussion.types';

export async function createDiscussion(data: CreateDiscussionInput): Promise<IDiscussion> {
  try {
    const natsClient = await connectToNats();
    const idToken = await getCookie(AUTH_COOKIE_NAME);

    const payload = {
      createDiscussionDto: {
        type: data.type,
        content: data.content,
        courseId: data.courseId,
        moduleId: data.moduleId,
        contentId: data.contentId,
        parentId: data.parentId,
      },
    };

    const response = await request(
      natsClient,
      'discussion.create',
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
    console.error('error from createDiscussion:', error);
    throw new Error(error.message || 'Failed to create discussion');
  }
}
