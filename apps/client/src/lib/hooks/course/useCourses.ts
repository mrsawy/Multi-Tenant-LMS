"use client";

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { createContent, deleteContentById, getContent, getContentsByModuleId } from '@/lib/actions/courses/content.action';
import { IContent } from '@/lib/types/course/content.interface';
import { CourseContentFormData } from '@/lib/schema/content.schema';
import { toast } from 'react-toastify';
import { useRouter } from "@/i18n/navigation";
import { getCourses, getCoursesByInstructor } from '@/lib/actions/courses/getCourses.action';
import { ICourse } from '@/lib/types/course/course.interface';
import { Paginated } from '@/lib/types/Paginated';
// import useGeneralStore from '../store/generalStore';

// Query keys
export const courseKeys = {
    all: ['course'] as const,
    organization: () => [...courseKeys.all, 'organization'] as const,
    byInstructor: (instructorId: string) => [...courseKeys.all, 'instructor', instructorId] as const,
};

// Custom hook for fetching content by module ID
export function useCourses() {
    return useQuery({
        queryKey: courseKeys.organization(),
        queryFn: async () => {
            const response = await getCourses()

            return response
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Custom hook for fetching courses by instructor with infinite scroll
export function useCoursesByInstructor(instructorId: string, limit: number = 12) {
    return useInfiniteQuery<Paginated<ICourse>>({
        queryKey: courseKeys.byInstructor(instructorId),
        queryFn: async ({ pageParam = 1 }) => {
            const response = await getCoursesByInstructor(instructorId, {
                page: typeof pageParam === 'number' ? pageParam : 1,
                limit,
            });
            console.dir({ response }, { depth: null })
            return response;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasNextPage) {
                return lastPage.nextPage;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}