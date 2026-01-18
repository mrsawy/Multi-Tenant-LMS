"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createContent, deleteContentById, getContent, getContentsByModuleId } from '@/lib/actions/courses/content.action';
import { IContent } from '@/lib/types/course/content.interface';
import { CourseContentFormData } from '@/lib/schema/content.schema';
import { toast } from 'react-toastify';
import { useRouter } from "@/i18n/navigation";
import { getCourses } from '@/lib/actions/courses/getCourses.action';
// import useGeneralStore from '../store/generalStore';

// Query keys
export const courseKeys = {
    all: ['course'] as const,
    organization: () => [...courseKeys.all, 'organization'] as const,
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
