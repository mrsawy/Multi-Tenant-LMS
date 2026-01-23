"use server"

import { ICourse } from "@/lib/types/course/course.interface"
import { createNatsRequest } from "@/lib/utils/createNatsRequest"
import { redis } from '@/lib/redis/client';
import { parseDurationToSeconds } from "@/lib/utils";

const isICourseArray = (data: unknown): data is ICourse[] => {
    if (!Array.isArray(data) || data.length === 0) return false;
    return data.every((item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item._id === 'string' &&
        typeof item.organizationId === 'string' &&
        typeof item.name === 'string' &&
        typeof item.isPaid === 'boolean' &&
        typeof item.pricing === 'object' &&
        item.pricing !== null &&
        Array.isArray(item.learningObjectives)
    );
};

export const getFeaturedCourses = async ({ limit = 10 }: { limit?: number } = {}) => {
    const cachedFeaturedCourses = await redis.get(`featuredCourses-${limit}`)
    if (cachedFeaturedCourses) {
        const parsed = JSON.parse(cachedFeaturedCourses);
        if (isICourseArray(parsed)) {
            return parsed;
        }
    }
    const featuredCourses = await createNatsRequest('courses.getFeatured', { limit }) as ICourse[]
    const ttlInSeconds = parseDurationToSeconds("5h")
    await redis.set(`featuredCourses-${limit}`, JSON.stringify(featuredCourses), 'EX', ttlInSeconds)
    return featuredCourses
}