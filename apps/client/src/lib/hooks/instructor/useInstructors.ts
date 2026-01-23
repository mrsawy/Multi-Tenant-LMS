"use client";

import { useInfiniteQuery } from '@tanstack/react-query';
import { findInstructors } from '@/lib/actions/instructors/getInstructors.action';
import { IInstructor } from '@/lib/types/user/user.interface';
import { Paginated } from '@/lib/types/Paginated';
import { IInstructorFilters } from '@/lib/types/instructor/IInstructorFilters';

// Query keys
export const instructorKeys = {
    all: ['instructors'] as const,
    list: (filters: IInstructorFilters) => [...instructorKeys.all, 'list', filters] as const,
};

// Custom hook for fetching instructors with infinite scroll
export function useInstructors(filters: IInstructorFilters, limit: number = 12) {
    // Create a stable query key that excludes searchCategories (which is only for UI)
    const queryFilters = {
        ...filters,
        searchCategories: undefined, // Never include in query key
    };

    return useInfiniteQuery<Paginated<IInstructor>>({
        queryKey: instructorKeys.list(queryFilters),
        queryFn: async ({ pageParam = 1 }) => {
            const response = await findInstructors({
                ...filters,
                page: typeof pageParam === 'number' ? pageParam : 1,
                limit,
            });
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