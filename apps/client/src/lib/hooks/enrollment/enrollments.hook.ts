"use client";

import { useQuery } from '@tanstack/react-query';
import { Paginated, PaginationOptions } from '@/lib/types/Paginated';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { IEnrollment } from '@/lib/types/enrollment/enrollment.interface';


// Query keys
export const enrollmentKeys = {
    all: ['enrollments'] as const,
    organization: () => [...enrollmentKeys.all, 'organization'] as const,
};

// Custom hook for fetching users by organization
export function useEnrollmentsByOrganization(options?: PaginationOptions, filters?: any) {
    return useQuery({
        queryKey: enrollmentKeys.organization(),
        queryFn: async () => {
            const enrollments = await createAuthorizedNatsRequest("enrollment.getOrganizationEnrollments", { options }) as Paginated<IEnrollment>;
            return enrollments;
        },
        // enabled: !!organization,
        staleTime: 5 * 60 * 1000, // 5 minutes        refetchOnMount: true, // Refetch when component mounts
        // refetchOnMount: true, // Refetch when component mounts

    });
}

