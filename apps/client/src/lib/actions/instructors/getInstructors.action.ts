'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { IInstructor } from '@/lib/types/user/user.interface';
import { Paginated } from '@/lib/types/Paginated';
import { IInstructorFilters } from '@/lib/types/instructor/IInstructorFilters';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';

export async function findInstructors(filters: IInstructorFilters) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        // Build filters object
        const mongoFilters: any = {};

        // Add search filter
        if (filters.search) {
            mongoFilters.$or = [
                { firstName: { $regex: filters.search, $options: 'i' } },
                { lastName: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }

        // Add minRating filter (averageCoursesRating)
        if (filters.minRating !== undefined && filters.minRating > 0) {
            // Convert to number to ensure MongoDB comparison works correctly
            const minRatingNum = typeof filters.minRating === 'string'
                ? parseFloat(filters.minRating)
                : Number(filters.minRating);

            if (!isNaN(minRatingNum) && minRatingNum > 0) {
                mongoFilters.averageCoursesRating = { $gte: minRatingNum };
            }
        }

        // Add category filter
        if (filters.selectedCategory) {
            mongoFilters.categoriesIds = filters.selectedCategory;
        }

        const response = await request<Paginated<IInstructor>>(
            natsClient,
            'instructors.findAll',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    options: { 
                        ...filters, 
                        limit: filters.limit || 12,
                        page: filters.page || 1
                    },
                    filters: Object.keys(mongoFilters).length > 0 ? mongoFilters : undefined
                }
            }),
        );


        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message);
        }


        return response;
    } catch (error) {
        throw new Error('Failed to fetch instructors');
    }
}

export async function getInstructor(instructorId: string) {
    try {
        const natsClient = await connectToNats();
        const response = await request<IInstructor>(
            natsClient,
            'instructors.findOne',
            JSON.stringify({
                id: v7(),
                data: {
                    instructorId: instructorId
                }
            }),
        );

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message);
        }

        return response;
    } catch (error) {
        console.log({ error })
        throw new Error('Failed to fetch instructor');
    }
}
