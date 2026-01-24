'use client';

import React from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
    addToWishlist,
    removeFromWishlistByCourse,
    getWishlist,
} from '@/lib/actions/wishlist/wishlist.action';
import { IWishlist, GetWishlistDto } from '@/lib/types/wishlist/wishlist.interface';
import { Paginated } from '@/lib/types/Paginated';
import {
    getLocalWishlist,
    addToLocalWishlist,
    removeFromLocalWishlist,
    isInLocalWishlist,
} from '@/lib/utils/localStorageWishlist';
import { ICourse } from '@/lib/types/course/course.interface';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';
import useUserStore from '@/lib/store/userStore';

export const wishlistKeys = {
    all: ['wishlist'] as const,
    lists: () => [...wishlistKeys.all, 'list'] as const,
    list: (filters: GetWishlistDto) => [...wishlistKeys.lists(), filters] as const,
};

export function useWishlist(options: GetWishlistDto = {}, limit: number = 10) {
    return useInfiniteQuery<Paginated<IWishlist>>({
        queryKey: wishlistKeys.list(options),
        queryFn: async ({ pageParam = 1 }) => {
            const page = typeof pageParam === 'number' ? pageParam : 1;
            const user = useUserStore.getState().user;
            if (user) {
                const result = await getWishlist({
                    ...options,
                    page,
                    limit,
                });
                // If result is null (not authenticated), return empty paginated result
                if (!result) {
                    return {
                        docs: [],
                        totalDocs: 0,
                        limit,
                        page,
                        totalPages: 0,
                        hasNextPage: false,
                        hasPrevPage: false,
                        nextPage: null,
                        prevPage: null,
                        pagingCounter: 0,
                    } as Paginated<IWishlist>;
                }
                return result;
            } else {
                const localItems = getLocalWishlist();
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const pageItems = localItems.slice(startIndex, endIndex);

                return {
                    docs: pageItems.map((item) => ({
                        _id: `local-${item.courseId}`,
                        userId: '',
                        courseId: item.courseId,
                        course: item.course, // Include course data if available
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    })) as IWishlist[],
                    totalDocs: localItems.length,
                    limit,
                    page,
                    totalPages: Math.ceil(localItems.length / limit),
                    hasNextPage: endIndex < localItems.length,
                    hasPrevPage: page > 1,
                    nextPage: endIndex < localItems.length ? page + 1 : null,
                    prevPage: page > 1 ? page - 1 : null,
                    pagingCounter: startIndex + 1,
                } as Paginated<IWishlist>;
            }

        },
        getNextPageParam: (lastPage) => {
            if (lastPage.hasNextPage) {
                return lastPage.nextPage;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: Infinity, // Never stale - data persists in localStorage
        gcTime: Infinity, // Keep in cache forever
    });
}

/**
 * Helper function to check if user is authenticated by checking for auth cookie
 */
function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    // Check if auth cookie exists in document.cookie
    const cookies = document.cookie.split(';');
    return cookies.some(cookie =>
        cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`)
    );
}

export function useAddToWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ courseId, course }: { courseId: string; course?: ICourse }) => {
            // If authenticated, try server first
            if (isAuthenticated()) {
                const result = await addToWishlist(courseId);
                // If server call failed (not authenticated), fallback to localStorage
                if (!result) {
                    addToLocalWishlist(courseId, course);
                }
                return { courseId, course, serverResult: result };
            }

            // Not authenticated, use localStorage only
            addToLocalWishlist(courseId, course);
            return { courseId, course, serverResult: null };
        },
        onMutate: async ({ courseId, course }: { courseId: string; course?: ICourse }) => {
            /**
             * EXPLANATION: Lines 111-112 (cancelQueries)
             * 
             * Cancel any ongoing queries for wishlist data to prevent race conditions.
             * This ensures that when we optimistically update the cache, we don't have
             * conflicting updates from in-flight requests that might overwrite our changes.
             * 
             * Example scenario:
             * - User clicks "Add to wishlist"
             * - A refetch is already in progress
             * - Without cancelQueries, the refetch might complete after our optimistic update
             *   and overwrite it with stale data
             */
            await queryClient.cancelQueries({ queryKey: wishlistKeys.all });

            const queryKey = wishlistKeys.list({});
            // Save the current state so we can rollback on error
            const previousData = queryClient.getQueryData(queryKey);

            /**
             * EXPLANATION: Lines 117-167 (Optimistic Update)
             * 
             * This is an "optimistic update" - we immediately update the UI before the server responds.
             * This gives instant feedback to the user, making the app feel faster.
             * 
             * How it works:
             * 1. We update the React Query cache immediately with the new item
             * 2. The UI re-renders instantly showing the new item
             * 3. The server request happens in the background
             * 4. If successful: cache is invalidated and refetched with real data
             * 5. If error: we rollback to previousData (see onError handler)
             * 
             * The update logic:
             * - If cache is empty: Initialize with a new page containing just this item
             * - If cache exists: Add the item to the first page and increment totalDocs
             * - We use a temporary ID (`temp-${courseId}`) that will be replaced with real ID on success
             */
            queryClient.setQueryData(queryKey, (old: any) => {

                // Case 1: No existing data - initialize the cache structure
                if (!old) {
                    return {
                        pages: [{
                            docs: [{
                                _id: `temp-${courseId}`, // Temporary ID, replaced on success
                                userId: '',
                                courseId,
                                course, // Include course data if available
                                isActive: true,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            } as IWishlist],
                            totalDocs: 1,
                            limit: 10,
                            page: 1,
                            totalPages: 1,
                            hasNextPage: false,
                            hasPrevPage: false,
                            nextPage: null,
                            prevPage: null,
                            pagingCounter: 1,
                        }],
                        pageParams: [1],
                    };
                }

                // Case 2: Existing data - add to first page
                const newPages = [...old.pages];
                if (newPages.length > 0) {
                    newPages[0] = {
                        ...newPages[0],
                        // Add new item at the beginning of the docs array
                        docs: [
                            {
                                _id: `temp-${courseId}`,
                                userId: '',
                                courseId,
                                course, // Include course data if available
                                isActive: true,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            } as IWishlist,
                            ...newPages[0].docs, // Keep existing items
                        ],
                        totalDocs: newPages[0].totalDocs + 1, // Increment count
                    };
                }

                return {
                    ...old,
                    pages: newPages,
                };
            });
            // Return previousData for potential rollback in onError
            return { previousData };
        },
        onError: (err: Error, { courseId }: { courseId: string; course?: ICourse }, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(wishlistKeys.list({}), context.previousData);
            }
            removeFromLocalWishlist(courseId);
            toast.error(err.message || 'Failed to add to wishlist');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
        },
    });
}

export function useRemoveFromWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (courseId: string) => {
            // If authenticated, try server first
            if (isAuthenticated()) {
                const result = await removeFromWishlistByCourse(courseId);
                // If server call failed (not authenticated), fallback to localStorage
                if (result === null) {
                    removeFromLocalWishlist(courseId);
                }
            } else {
                // Not authenticated, use localStorage only
                removeFromLocalWishlist(courseId);
            }
            return { courseId };
        },
        onMutate: async (courseId: string) => {
            await queryClient.cancelQueries({ queryKey: wishlistKeys.all });

            const queryKey = wishlistKeys.list({});
            const previousData = queryClient.getQueryData(queryKey);

            // Optimistically remove from all pages
            queryClient.setQueryData(queryKey, (old: any) => {
                if (!old || !old.pages || old.pages.length === 0) return old;

                const newPages = old.pages.map((page: Paginated<IWishlist>, index: number) => {
                    const filteredDocs = page.docs.filter((item) => item.courseId !== courseId);
                    const wasRemoved = filteredDocs.length < page.docs.length;

                    // Update totalDocs only on first page (which has the total count)
                    if (index === 0 && wasRemoved) {
                        return {
                            ...page,
                            docs: filteredDocs,
                            totalDocs: Math.max(0, page.totalDocs - 1),
                        };
                    }

                    return {
                        ...page,
                        docs: filteredDocs,
                    };
                });

                return {
                    ...old,
                    pages: newPages,
                };
            });

            return { previousData };
        },
        onError: (err: Error, courseId: string, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(wishlistKeys.list({}), context.previousData);
            }
            addToLocalWishlist(courseId);
            toast.error(err.message || 'Failed to remove from wishlist');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
        },
    });
}

export function useIsInWishlist(courseId: string) {
    const { data: wishlistData } = useWishlist({});
    const user = useUserStore((state) => state.user);

    // Check localStorage immediately for instant feedback on first render
    const [localState, setLocalState] = React.useState(() => {
        if (typeof window === 'undefined') return false;
        return isInLocalWishlist(courseId);
    });

    // Update local state when courseId changes or when we need to sync
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            setLocalState(isInLocalWishlist(courseId));
        }
    }, [courseId]);

    // Use useMemo to compute the final state, prioritizing server data when available
    const isInWishlist = React.useMemo(() => {
        // If user is authenticated and we have server data, check server first
        if (user && wishlistData?.pages && wishlistData.pages.length > 0) {
            const allItems = wishlistData.pages.flatMap((page: Paginated<IWishlist>) => page.docs);
            const inServerWishlist = allItems.some((item) => item.courseId === courseId);
            return Boolean(inServerWishlist);
        }

        // For unauthenticated users or while server data is loading, use localStorage
        return Boolean(localState);
    }, [courseId, wishlistData, user, localState]);

    return Boolean(isInWishlist);
}
