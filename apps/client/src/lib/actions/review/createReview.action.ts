'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from 'uuid';
import { NatsError } from 'nats';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';

// Can import ReviewType from shared location if possible, else define it here or use string
import { ReviewType, CreateReviewInput } from '@/lib/types/review/review.types';

export async function createReview(data: CreateReviewInput) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        // We need to match CreateReviewDto structure expected by NestJS
        // ReviewControllerMessage: @Payload(new RpcValidationPipe()) createReviewDto: CreateReviewDto
        // And it sets userId from context.

        const payload = {
            reviewType: data.reviewType,
            rating: data.rating,
            comment: data.comment,
            courseId: data.courseId,
            moduleId: data.moduleId,
            contentId: data.contentId,
            instructorId: data.instructorId,
            reviewedOrganizationId: data.reviewedOrganizationId,
            // Add other fields if necessary
        };

        const response = await request(
            natsClient,
            'reviews.create',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    ...payload
                }
            }),
        );

        if ('err' in (response as any)) {
            throw new Error(((response as any) as { err: NatsError }).err.message)
        }

        return response;
    } catch (error: any) {
        console.error("error from createReview:", error)
        throw new Error(error.message || "Failed to create review")
    }
}
