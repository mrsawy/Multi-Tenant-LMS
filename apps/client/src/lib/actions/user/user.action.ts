'use server';

import { AUTH_COOKIE_NAME } from '@/middleware';

import { getCookie } from '@/lib/utils/serverUtils';
import { redis } from '@/lib/redis/client';
import { IUser } from '@/lib/types/user/user.interface';
import { connectToNats, request as natsRequest } from '@/lib/nats/client';
import { v7 } from 'uuid';



export async function getAuthUser() {
    const idToken = await getCookie(AUTH_COOKIE_NAME);
    if (!idToken) return;

    const cachedUserString = await redis.get(`auth-${idToken}`);
    if (cachedUserString) {
        const user = JSON.parse(cachedUserString) as IUser;
        return user;
    }

    const natsClient = await connectToNats();
    const response = await natsRequest<{ message: string, user: IUser } | { err: { message: string } }>(
        natsClient,
        'user.getOwnData',
        JSON.stringify({
            id: v7(),
            data: { authorization: idToken },
        }),
    );

    if ('err' in (response as any)) return;
    return (response as { message: string, user: IUser }).user;
}