"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCourseWithModules, createCourseModule, updateModule, deleteModule, deleteModules, getModule } from '@/lib/actions/courses/modules.action';
import { IModule } from '@/lib/types/course/modules.interface';
import { CreateModuleSchema, UpdateModuleSchema } from '@/lib/schema/module.schema';
import { toast } from 'react-toastify';
import useGeneralStore from '@/lib/store/generalStore';


// Query keys
export const modulesKeys = {
  all: ['modules'] as const,
  course: (courseId: string) => [...modulesKeys.all, 'course', courseId] as const,
  module: (moduleId: string) => [...modulesKeys.all, 'module', moduleId] as const,
};

// Custom hook for fetching modules by course ID
export function useModules(courseId: string) {
  return useQuery({
    queryKey: modulesKeys.course(courseId),
    queryFn: async () => {
      const response = await getCourseWithModules(courseId);
      return response?.modules || [];
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
// Custom hook for deleting a single module
export function useDeleteModule(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleId: string) => {
      useGeneralStore.setState({ generalIsLoading: true })
      return await deleteModule(moduleId);
    },
    onSuccess: (data, moduleId) => {
      console.log({ data })
      // Remove the module from cache
      queryClient.removeQueries({ queryKey: modulesKeys.course(courseId) });
      // Invalidate all course modules to refresh the list
      queryClient.invalidateQueries({ queryKey: modulesKeys.course(courseId) });

      toast.success('Module deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    },
    onSettled: () => {
      useGeneralStore.setState({ generalIsLoading: false })
    }
  });
}

// Custom hook for creating a module
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, moduleData }: { courseId: string; moduleData: CreateModuleSchema }) => {
      return await createCourseModule({ ...moduleData, courseId });
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch modules for the course
      console.log('useCreateModule    :', variables.courseId, 'queryKey:', modulesKeys.course(variables.courseId));
      queryClient.invalidateQueries({ queryKey: modulesKeys.course(variables.courseId) });

      toast.success('Module created successfully');
    },
    onError: (error) => {
      console.error('Error creating module:', error);
      toast.error('Failed to create module');
    },
  });
}

// Custom hook for fetching a single module
export function useModule(moduleId: string) {
  return useQuery({
    queryKey: modulesKeys.module(moduleId),
    queryFn: () => getModule(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}


// Custom hook for updating a module
export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleId, updateData }: { moduleId: string; updateData: UpdateModuleSchema }) => {
      return await updateModule(moduleId, updateData);
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific module and all course modules
      queryClient.invalidateQueries({ queryKey: modulesKeys.module(variables.moduleId) });
      // We need to invalidate all course modules since we don't know which course this module belongs to
      queryClient.invalidateQueries({ queryKey: modulesKeys.all });
      toast.success('Module updated successfully');
    },
    onError: (error) => {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    },
  });
}



// Custom hook for deleting multiple modules
export function useDeleteModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moduleIds: string[]) => {
      return await deleteModules(moduleIds);
    },
    onSuccess: (data, moduleIds) => {
      // Remove all deleted modules from cache
      moduleIds.forEach(moduleId => {
        queryClient.removeQueries({ queryKey: modulesKeys.module(moduleId) });
      });
      // Invalidate all course modules to refresh the list
      queryClient.invalidateQueries({ queryKey: modulesKeys.all });
      toast.success(`${moduleIds.length} module(s) deleted successfully`);
    },
    onError: (error) => {
      console.error('Error deleting modules:', error);
      toast.error('Failed to delete modules');
    },
  });
}

// Helper function to get module count for a course
export function useModuleCount(courseId: string) {
  const { data: modules } = useModules(courseId);
  return modules?.length || 0;
}
