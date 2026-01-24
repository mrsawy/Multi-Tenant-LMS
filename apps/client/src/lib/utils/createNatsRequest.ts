'use server';

import { getCookie, setCookie } from './serverUtils';
import { v7 } from 'uuid';
import { connectToNats, request } from '@/lib/nats/client';
import NatsError from '../nats/error';
import { AUTH_COOKIE_NAME } from '../data/constants';
import { redis } from '../redis/client';

interface NatsRequestPayload<T = any> {
  id: string;
  data: T;
}

// Utility functions
export async function createAuthorizedNatsRequest<R = any, T = any>(
  subject: string,
  data: Partial<T> = {},
): Promise<R> {
  const natsClient = await connectToNats();
  const idToken = await getCookie(AUTH_COOKIE_NAME);

  if (!idToken) {
    throw new Error('Authentication token not found');
  }

  const payload: NatsRequestPayload<Partial<T> & { authorization: string }> = {
    id: v7(),
    data: {
      authorization: idToken,
      ...data,
    },
  };

  const response = await request<R | { err: NatsError }>(
    natsClient,
    subject,
    JSON.stringify(payload),
  );
  // console.log({ response });

  if (typeof response === 'object' && response !== null && 'err' in response) {
    // console.log({ response })
    if (response.err.message.startsWith('auth-failed-')) {
      await redis.del(`auth-${idToken}`);
      await setCookie(AUTH_COOKIE_NAME, '', {
        httpOnly: process.env.NODE_ENV === 'production',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
      });
    }
    throw new Error((response as { err: NatsError }).err.message);
  }

  return response;
}

export async function createNatsRequest<T>(
  subject: string,
  data: T,
): Promise<any> {
  const natsClient = await connectToNats();

  const payload: NatsRequestPayload<T> = {
    id: v7(),
    data: {
      ...data,
    },
  };

  const response = await request<any>(
    natsClient,
    subject,
    JSON.stringify(payload),
  );

  if ('err' in response) {
    throw new Error((response as { err: NatsError }).err.message);
  }

  return response;
}
