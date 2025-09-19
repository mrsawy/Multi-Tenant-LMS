"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createContent, deleteContentById, getContent, getContentsByModuleId } from '@/lib/actions/courses/content.action';
import { IContent } from '@/lib/types/course/content.interface';
import { CourseContentFormData } from '@/lib/schema/content.schema';
import { toast } from 'react-toastify';
import { useRouter } from "@/i18n/navigation";
// import useGeneralStore from '../store/generalStore';

// Query keys
export const contentKeys = {
  all: ['content'] as const,
  module: (moduleId: string) => [...contentKeys.all, 'module', moduleId] as const,
  content: (contentId: string) => [...contentKeys.all, 'content', contentId] as const,
  course: (courseId: string) => [...contentKeys.all, 'course', courseId] as const,
};

// Custom hook for fetching content by module ID
export function useContentByModule(moduleId: string) {
  return useQuery({
    queryKey: contentKeys.module(moduleId),
    queryFn: async () => {
      const module = await getContentsByModuleId(moduleId)
      return module
    },
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


// Custom hook for creating content
export function useCreateContent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      moduleId,
      courseId,
      contentData,
      fileKey
    }: {
      moduleId: string;
      courseId: string;
      contentData: CourseContentFormData;
      fileKey?: string;
    }) => {
      return await createContent(moduleId, courseId, contentData, fileKey);
    },
    onSuccess: (data, variables) => {
      console.log({ data, variables });
      toast.success("Content created successfully");
      queryClient.invalidateQueries({ queryKey: contentKeys.module(variables.moduleId) });
      queryClient.invalidateQueries({ queryKey: contentKeys.course(variables.courseId) });
      router.push(`/organization-dashboard/courses/${variables.courseId}/modules/${variables.moduleId}/content`);
    },
    onError: (error) => {
      console.error('Error creating content:', error);
      toast.error('Failed to create content');
    }
  });
}
// Custom hook for fetching content by course ID
export function useContentByCourse(courseId: string) {
  return useQuery({
    queryKey: contentKeys.course(courseId),
    queryFn: async () => {
      // This would need to be implemented in the content actions
      // For now, we'll return an empty array
      return [];
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Custom hook for fetching a single content item
export function useContent(contentId: string) {
  return useQuery({
    queryKey: contentKeys.content(contentId),
    queryFn: () => getContent(contentId),
    enabled: !!contentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Custom hook for updating content
// export function useUpdateContent() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({
//       contentId,  updateData
//     }: {
//       contentId: string,  updateData: Partial<IContent>
//     }) => {

      
//     },
//     onSuccess: (data, variables) => {
//       // Invalidate the specific content and related queries
//       queryClient.invalidateQueries({ queryKey: contentKeys.content(variables.contentId) });
//       queryClient.invalidateQueries({ queryKey: contentKeys.all });
//       toast.success('Content updated successfully');
//     },
//     onError: (error) => {
//       console.error('Error updating content:', error);
//       toast.error('Failed to update content');
//     },
//   });
// }

// Custom hook for deleting content
export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      // This would need to be implemented in the content actions
      // throw new Error('Delete content not implemented yet');
      return await deleteContentById(contentId)


    },
    onSuccess: (data, contentId) => {
      // Remove the content from cache
      queryClient.removeQueries({ queryKey: contentKeys.content(contentId) });
      // Invalidate all content queries to refresh the list
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      toast.success('Content deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    },
  });
}

// Custom hook for deleting multiple content items
export function useDeleteContents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentIds: string[]) => {
      // This would need to be implemented in the content actions
      throw new Error('Delete multiple content not implemented yet');
    },
    onSuccess: (data, contentIds) => {
      // Remove all deleted content from cache
      contentIds.forEach(contentId => {
        queryClient.removeQueries({ queryKey: contentKeys.content(contentId) });
      });
      // Invalidate all content queries to refresh the list
      queryClient.invalidateQueries({ queryKey: contentKeys.all });
      toast.success(`${contentIds.length} content item(s) deleted successfully`);
    },
    onError: (error) => {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    },
  });
}

// Helper function to get content count for a module
export function useContentCount(moduleId: string) {
  const { data: module } = useContentByModule(moduleId);
  return module?.contents?.length || 0;
}

// Helper function to get content count for a course
export function useContentCountByCourse(courseId: string) {
  const { data: content } = useContentByCourse(courseId);
  return content?.length || 0;
}
