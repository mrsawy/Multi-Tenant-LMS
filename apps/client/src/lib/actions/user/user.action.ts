'use server';

import { AUTH_COOKIE_NAME } from '@/middleware';

import { getCookie } from '@/lib/utils/serverUtils';
import { redis } from '@/lib/redis/client';
import { IUser } from '@/lib/types/user/user.interface';



export async function getAuthUser() {
    const idToken = await getCookie(AUTH_COOKIE_NAME);
    const redisObject = await redis.get(`auth-${idToken}`);
    if (!redisObject) return;
    const user = JSON.parse(redisObject ?? '{}') as IUser;
    return user;
}