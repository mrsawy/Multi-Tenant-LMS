"use server"

import { ICourse } from "@/lib/types/course/course.interface"
import { createNatsRequest } from "@/lib/utils/createNatsRequest"
import { redis } from '@/lib/redis/client';
import { parseDurationToSeconds } from "@/lib/utils";


export const getFeaturedCourses = async ({ limit = 10 }: { limit?: number } = {}) => {
    const cachedFeaturedCourses = await redis.get(`featuredCourses-${limit}`)
    if (cachedFeaturedCourses) {
        return JSON.parse(cachedFeaturedCourses) as ICourse[]
    }
    const featuredCourses = await createNatsRequest('courses.getFeatured', { limit }) as ICourse[]
    const ttlInSeconds = parseDurationToSeconds("5h")
    await redis.set(`featuredCourses-${limit}`, JSON.stringify(featuredCourses), 'EX', ttlInSeconds)
    return featuredCourses
}
