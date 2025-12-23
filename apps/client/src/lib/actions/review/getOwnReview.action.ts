'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import { ReviewType } from '@/lib/types/review/review.types';

export interface FindOwnReviewInput {
    reviewType: ReviewType;
    courseId?: string;
    moduleId?: string;
    contentId?: string;
    instructorId?: string;
    reviewedOrganizationId?: string;
}

export async function getOwnReview(filters: FindOwnReviewInput) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request(
            natsClient,
            'reviews.findOwn',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    ...filters
                }
            }),
        );

        if ('err' in (response as any)) {
            throw new Error(((response as any) as { err: NatsError }).err.message)
        }

        return response; // Returns null if no review found
    } catch (error: any) {
        console.error("error from getOwnReview:", error)
        throw new Error(error.message || "Failed to get own review")
    }
}
