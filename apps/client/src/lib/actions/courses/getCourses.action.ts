'use server';


import { getCookie } from '@/lib/utils/serverUtils';
import { redis } from '@/lib/redis/client';
import { IUser } from '@/lib/types/user/user.interface';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { ICourse } from '@/lib/types/course/course.interface';
import { Paginated } from '@/lib/types/Paginated';
import { ICourseFilters } from '@/lib/types/course/ICourseFilters';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';



export async function findCourses(filters: ICourseFilters) {
    try {
        const natsClient = await connectToNats();
        const response = await request<Paginated<ICourse>>(
            natsClient,
            'courses.findAllCourses',
            JSON.stringify({
                id: v7(),
                data: {
                    options: filters
                }
            }),
        );
        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        return response
    } catch (error) {
        throw new Error()
    }

}



export async function getCourses() {
    try {
        const natsClient = await connectToNats();

        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<Paginated<ICourse>>(
            natsClient,
            'courses.getAllCourses',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    options: { page: 1, limit: 10 }
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

export async function getCoursesByInstructor(instructorId: string, options?: { page?: number; limit?: number }) {
    try {
        const natsClient = await connectToNats();
        const response = await request<Paginated<ICourse>>(
            natsClient,
            'courses.findAllCourses',
            JSON.stringify({
                id: v7(),
                data: {
                    options: {
                        $or: [
                            { instructorId },
                            { coInstructorsIds: instructorId }
                        ],
                        page: options?.page || 1,
                        limit: options?.limit || 20,
                        ...options
                    }
                }
            }),
        );
        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        return response
    } catch (error) {
        throw new Error()
    }
}