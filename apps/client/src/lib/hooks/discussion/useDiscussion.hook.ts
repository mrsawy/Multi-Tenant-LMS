import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DiscussionType,
  GetDiscussionsInput,
  CreateDiscussionInput,
  IDiscussionWithReplies,
  UpdateDiscussionInput,
} from '@/lib/types/discussion/discussion.types';
import { getDiscussions } from '@/lib/actions/discussion/getDiscussions.action';
import { createDiscussion } from '@/lib/actions/discussion/createDiscussion.action';
import { updateDiscussion } from '@/lib/actions/discussion/updateDiscussion.action';
import { deleteDiscussion } from '@/lib/actions/discussion/deleteDiscussion.action';
import { toggleLike } from '@/lib/actions/discussion/toggleLike.action';
import { toast } from 'react-toastify';

interface UseDiscussionProps {
  type: DiscussionType;
  entityId: string;
  moduleId?: string;
  contentId?: string;
  parentId?: string;
  enabled?: boolean;
}

export function useDiscussion({
  type,
  entityId,
  moduleId,
  contentId,
  parentId,
  enabled = true,
}: UseDiscussionProps) {
  const queryClient = useQueryClient();
  const limit = 10;
  const queryKey = ['discussions', type, entityId, moduleId, contentId, parentId];

  // Infinite Scroll Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const input: GetDiscussionsInput = {
        type,
        entityId,
        moduleId,
        contentId,
        parentId,
        page: pageParam,
        limit,
      };
      return getDiscussions(input);
    },
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      const totalPages = Math.ceil(lastPage.totalDocs / limit);
      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialPageParam: 1,
    enabled,
  });

  const discussions = data?.pages.flatMap((page) => page.docs) || [];
  const total = data?.pages[0]?.totalDocs || 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      const input: CreateDiscussionInput = {
        type,
        content,
        // Assuming entityId is courseId if type is COURSE, otherwise passed accordingly
        // This logic mimics what was in DiscussionItem/DiscussionSection
        courseId: type === DiscussionType.COURSE ? entityId : (moduleId ? entityId : undefined),
        moduleId,
        contentId,
        parentId,
      };
      // Fallback if courseId is missing for non-course types but entityId is available
      if (type !== DiscussionType.COURSE && !input.courseId) {
          input.courseId = entityId; 
      }
      return createDiscussion(input);
    },
    onSuccess: () => {
      toast.success('Discussion posted successfully');
      // Invalidate the query to refetch the list
      queryClient.invalidateQueries({ queryKey });
      // Also invalidate parent query if this is a reply (to update reply count)
      if (parentId) {
         // This is tricky without knowing the parent's query key exactly (it might be in a different list)
         // But we can invalidate loosely or rely on the parent component triggering a refetch if it listens to something
         // For now, refetching the current list (replies) is enough for the user seeing the new reply.
         // If we want to update the parent's "reply count", we might need to invalidate the ROOT list too.
         queryClient.invalidateQueries({ queryKey: ['discussions', type, entityId, moduleId, contentId, undefined] });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to post discussion');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      return updateDiscussion(id, { content });
    },
    onSuccess: () => {
      toast.success('Discussion updated successfully');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update discussion');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteDiscussion(id);
    },
    onSuccess: () => {
      toast.success('Discussion deleted successfully');
      queryClient.invalidateQueries({ queryKey });
       if (parentId) {
         queryClient.invalidateQueries({ queryKey: ['discussions', type, entityId, moduleId, contentId, undefined] });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete discussion');
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async (id: string) => {
      return toggleLike(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to toggle like');
    },
  });

  return {
    discussions,
    total,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    createDiscussion: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateDiscussion: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteDiscussion: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    toggleLike: toggleLikeMutation.mutateAsync,
  };
}
