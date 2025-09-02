'use server';

import { AUTH_COOKIE_NAME } from '@/middleware';

import { getCookie } from '@/lib/utils/serverUtils';
import { redis } from '@/lib/redis/client';
import { IUser } from '@/lib/types/user/user.interface';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { ICourse } from '@/lib/types/course/course.interface';



export async function getCourses() {
    try {
        const natsClient = await connectToNats();

        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<ICourse>(
            natsClient,
            'courses.getAllCourses',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken
                }
            }),
        );

        console.dir({ response }, { depth: null })
        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        return response
    } catch (error) {
        console.error("error frmo getCourses:", error)
        throw new Error()
    }

}