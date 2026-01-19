"use server"

import { IInstructor } from "@/lib/types/user/user.interface"
import { createNatsRequest } from "@/lib/utils/createNatsRequest"
import { redis } from '@/lib/redis/client';
import { parseDurationToSeconds } from "@/lib/utils";


export const getFeaturedInstructors = async ({ limit = 10 }: { limit?: number } = {}) => {
    const cachedFeaturedInstructors = await redis.get(`featuredInstructors-${limit}`)
    if (cachedFeaturedInstructors) {
        return JSON.parse(cachedFeaturedInstructors) as IInstructor[]
    }
    const featuredInstructors = await createNatsRequest('instructors.getFeatured', { limit }) as IInstructor[]
    const ttlInSeconds = parseDurationToSeconds("5h")
    await redis.set(`featuredInstructors-${limit}`, JSON.stringify(featuredInstructors), 'EX', ttlInSeconds)
    return featuredInstructors
}