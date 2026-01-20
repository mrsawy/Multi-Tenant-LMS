"use server"

import { IInstructor } from "@/lib/types/user/user.interface"
import { createNatsRequest } from "@/lib/utils/createNatsRequest"
import { redis } from '@/lib/redis/client';
import { parseDurationToSeconds } from "@/lib/utils";

const isIInstructorArray = (data: unknown): data is IInstructor[] => {
    if (!Array.isArray(data) || data.length === 0) return false;
    return data.every((item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item._id === 'string' &&
        typeof item.organizationId === 'string' &&
        typeof item.firstName === 'string' &&
        typeof item.lastName === 'string' &&
        typeof item.roleName === 'string'
    );
};

export const getFeaturedInstructors = async ({ limit = 10 }: { limit?: number } = {}) => {
    const cachedFeaturedInstructors = await redis.get(`featuredInstructors-${limit}`)
    if (cachedFeaturedInstructors) {
        const parsed = JSON.parse(cachedFeaturedInstructors);
        if (isIInstructorArray(parsed)) {
            return parsed;
        }
    }
    const featuredInstructors = await createNatsRequest('instructors.getFeatured', { limit }) as IInstructor[]
    const ttlInSeconds = parseDurationToSeconds("5h")
    await redis.set(`featuredInstructors-${limit}`, JSON.stringify(featuredInstructors), 'EX', ttlInSeconds)
    return featuredInstructors
}