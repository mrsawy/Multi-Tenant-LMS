'use server';


import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { ICourse } from '@/lib/types/course/course.interface';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';

export async function getCourse(courseId: string) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<ICourse>(
            natsClient,
            'courses.getCourse',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    courseId
                }
            }),
        );

        console.dir({ response }, { depth: null })
        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        return response
    } catch (error) {
        console.error("error from getCourse:", error)
        throw new Error("Failed to fetch course")
    }
}
