'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Paginated, PaginationOptions } from '@/lib/types/Paginated';
import { createAuthorizedNatsRequest } from '@/lib/utils/createNatsRequest';
import { IPage } from '@/lib/types/page/page.interface';
import { toast } from 'react-toastify';

// Query keys
export const pageKeys = {
  all: ['pages'] as const,
  organization: (options?: PaginationOptions) =>
    [...pageKeys.all, 'organization', options] as const,
  detail: (slug: string) => [...pageKeys.all, 'detail', slug] as const,
};

// Hook for fetching pages by organization
export function usePagesByOrganization(options?: PaginationOptions) {
  return useQuery({
    queryKey: pageKeys.organization(options),
    queryFn: async () => {
      const pages = (await createAuthorizedNatsRequest('pages.findAllPages', {
        options,
      })) as Paginated<IPage>;
      return pages;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
  });
}

// Hook for fetching a single page by slug
export function usePageBySlug(slug: string, enabled: boolean = true) {
  return useQuery({
    queryKey: pageKeys.detail(slug),
    queryFn: async () => {
      const page = (await createAuthorizedNatsRequest(
        'pages.findOnePage',
        slug,
      )) as IPage;
      return page;
    },
    enabled: !!slug && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for creating a page
export function useCreatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (createPageDto: {
      title: string;
      slug: string;
      published: boolean;
      pageData?: Record<string, any>;
    }) => {
      const page = await createAuthorizedNatsRequest(
        'pages.createPage',
        createPageDto,
      );
      return page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
      toast.success('Page created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error creating page');
    },
  });
}

// Hook for updating a page
export function useUpdatePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updatePageDto: {
      slug: string;
      title?: string;
      published?: boolean;
      pageData?: Record<string, any>;
    }) => {
      const page = await createAuthorizedNatsRequest(
        'pages.updatePage',
        updatePageDto,
      );
      return page;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
      queryClient.invalidateQueries({
        queryKey: pageKeys.detail(variables.slug),
      });
      toast.success('Page updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error updating page');
    },
  });
}

// Hook for toggling page published status
export function useTogglePageStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      slug,
      published,
    }: {
      slug: string;
      published: boolean;
    }) => {
      const page = await createAuthorizedNatsRequest('pages.updatePage', {
        slug,
        published,
      });
      return page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
      toast.success('Page status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error updating page status');
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_id: string) => {
      const page = await createAuthorizedNatsRequest('pages.deletePage', {
        _id,
      });
      return page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pageKeys.all });
      toast.success('Page Deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Error Deleting page status');
    },
  });
}
