"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { createUser, deleteUserById, getUser, getUsersByOrganization, updateUser } from '@/lib/actions/users/user.action';
import { IUser } from '@/lib/types/user/user.interface';
import { CreateUserFormData, EditUserFormData } from '@/lib/schema/user.schema';
import { toast } from 'react-toastify';
import { useRouter } from "@/i18n/navigation";
import useGeneralStore from '@/lib/store/generalStore';


// Query keys
export const userKeys = {
    all: ['users'] as const,
    organization: (organizationId: string) => [...userKeys.all, 'organization', organizationId] as const,
    user: (userId: string) => [...userKeys.all, 'user', userId] as const,
    role: (role: string) => [...userKeys.all, 'role', role] as const,
    status: (status: string) => [...userKeys.all, 'status', status] as const,
};

// Custom hook for fetching users by organization
export function useUsersByOrganization(organizationId: string) {
    return useQuery({
        queryKey: userKeys.organization(organizationId),
        queryFn: async () => {
            // const users = await getUsersByOrganization(organizationId);
            // return users;
        },
        enabled: !!organizationId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Custom hook for fetching a single user
export function useUser(userId: string) {
    return useQuery({
        queryKey: userKeys.user(userId),
        queryFn: () => {
            // getUser(userId)
        },
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Custom hook for creating a user
export function useCreateUser() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (userData: CreateUserFormData) => {
            // return await createUser(userData);
        },
        onSuccess: (data, variables) => {
            console.log({ data, variables });
            toast.success("User created successfully");

            // Invalidate organization users query if organizationId is provided
            if (variables.organizationId) {
                queryClient.invalidateQueries({ queryKey: userKeys.organization(variables.organizationId) });
            }
            queryClient.invalidateQueries({ queryKey: userKeys.all });

            router.push('/organization-dashboard/users');
        },
        onError: (error) => {
            console.error('Error creating user:', error);
            toast.error('Failed to create user');
        },
        onMutate: () => {
            useGeneralStore.setState({ generalIsLoading: true });
        },
        onSettled: () => {
            useGeneralStore.setState({ generalIsLoading: false });
        }
    });
}

// Custom hook for updating a user
export function useUpdateUser() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async ({
            userId,
            updateData
        }: {
            userId: string;
            updateData: Partial<EditUserFormData>;
        }) => {
            // return await updateUser(userId, updateData);
        },
        onSuccess: (data, variables) => {
            console.log({ data, variables });
            toast.success("User updated successfully");

            // Invalidate the specific user and related queries
            queryClient.invalidateQueries({ queryKey: userKeys.user(variables.userId) });
            queryClient.invalidateQueries({ queryKey: userKeys.all });

            router.push('/organization-dashboard/users');
        },
        onError: (error) => {
            console.error('Error updating user:', error);
            toast.error('Failed to update user');
        },
        onMutate: () => {
            useGeneralStore.setState({ generalIsLoading: true });
        },
        onSettled: () => {
            useGeneralStore.setState({ generalIsLoading: false });
        }
    });
}

// Custom hook for deleting a user
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            // return await deleteUserById(userId);
        },
        onSuccess: (data, userId) => {
            // Remove the user from cache
            queryClient.removeQueries({ queryKey: userKeys.user(userId) });
            // Invalidate all user queries to refresh the list
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast.success('User deleted successfully');
        },
        onError: (error) => {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        },
        onMutate: () => {
            useGeneralStore.setState({ generalIsLoading: true });
        },
        onSettled: () => {
            useGeneralStore.setState({ generalIsLoading: false });
        }
    });
}

// Custom hook for deleting multiple users
export function useDeleteUsers() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userIds: string[]) => {
            // This would need to be implemented in the user actions
            // const promises = userIds.map(userId => deleteUserById(userId));
            // return await Promise.all(promises);
        },
        onSuccess: (data, userIds) => {
            // Remove all deleted users from cache
            userIds.forEach(userId => {
                queryClient.removeQueries({ queryKey: userKeys.user(userId) });
            });
            // Invalidate all user queries to refresh the list
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast.success(`${userIds.length} user(s) deleted successfully`);
        },
        onError: (error) => {
            console.error('Error deleting users:', error);
            toast.error('Failed to delete users');
        },
        onMutate: () => {
            useGeneralStore.setState({ generalIsLoading: true });
        },
        onSettled: () => {
            useGeneralStore.setState({ generalIsLoading: false });
        }
    });
}

// Custom hook for updating user status
export function useUpdateUserStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            status
        }: {
            userId: string;
            status: string;
        }) => {
            // return await updateUser(userId, { status });
        },
        onSuccess: (data, variables) => {
            // Invalidate the specific user and related queries
            queryClient.invalidateQueries({ queryKey: userKeys.user(variables.userId) });
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            toast.success('User status updated successfully');
        },
        onError: (error) => {
            console.error('Error updating user status:', error);
            toast.error('Failed to update user status');
        }
    });
}

// Helper hook to get user count for an organization
export function useUserCount(organizationId: string) {
    // const { data: users } = useUsersByOrganization(organizationId);
    // return users?.length || 0;
}

// Helper hook to get users by role
export function useUsersByRole(organizationId: string, role: string) {
    // const { data: users } = useUsersByOrganization(organizationId);
    // return users?.filter((user: any) => user.role === role) || [];
}

// Helper hook to get users by status
export function useUsersByStatus(organizationId: string, status: string) {
    // const { data: users } = useUsersByOrganization(organizationId);
    // return users?.filter((user: any) => user.status === status) || [];
}