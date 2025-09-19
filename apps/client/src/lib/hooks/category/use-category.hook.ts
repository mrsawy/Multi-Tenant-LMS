"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
    createCategory,
    getAllCategories,
    deleteCategory,
    updateCategory,
    getCategory,
} from "@/lib/actions/category/category.action";
import { Paginated, PaginationOptions } from "@/lib/types/Paginated";
import { ICategory } from "@/lib/types/category/ICategory";

// Query keys for categories
export const categoryKeys = {
    all: ["categories"] as const,
    organization: (organizationId: string) =>
        [...categoryKeys.all, "organization", organizationId] as const,
    category: (categoryId: string) =>
        [...categoryKeys.all, "category", categoryId] as const,
};


export function useSingleCategory(categoryId: string) {
    return useQuery<ICategory>({
        queryKey: categoryKeys.category(categoryId),
        queryFn: () => getCategory(categoryId),
        // enabled: !!options.organizationId,
        staleTime: 5 * 60 * 1000,
    });


}

// Fetch paginated categories by organization
export function useCategoriesByOrganization(
    options: PaginationOptions<{ organizationId: string }>
) {
    return useQuery<Paginated<ICategory>>({
        queryKey: categoryKeys.organization(options.organizationId),
        queryFn: () => getAllCategories(options),
        enabled: !!options.organizationId,
        staleTime: 5 * 60 * 1000,
    });
}

// Create a new category
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PaginationOptions<{ organizationId: string; name: string; parentId?: string | null }>) =>
            createCategory(data),
        onSuccess: (data, variables) => {
            toast.success("Category created successfully");

            // Invalidate organization categories query
            if (variables.organizationId) {
                queryClient.invalidateQueries({
                    queryKey: categoryKeys.organization(variables.organizationId),
                });
            }
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        },
        onError: (error: any) => {
            console.error("Error creating category:", error);
            toast.error("Failed to create category");
        },
    });
}

// Update a category
export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PaginationOptions<{ organizationId: string; categoryId: string }>) =>
            updateCategory(data),
        onSuccess: (data, variables) => {
            toast.success("Category updated successfully");
            queryClient.invalidateQueries({
                queryKey: categoryKeys.organization(variables.organizationId),
            });
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        },
        onError: (error: any) => {
            console.error("Error updating category:", error);
            toast.error("Failed to update category");
        },
    });
}

// Delete a category
export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PaginationOptions<{ organizationId: string; categoryId: string }>) =>
            deleteCategory(data),
        onSuccess: (data, variables) => {
            toast.success("Category deleted successfully");
            queryClient.invalidateQueries({
                queryKey: categoryKeys.organization(variables.organizationId),
            });
            queryClient.invalidateQueries({ queryKey: categoryKeys.all });
        },
        onError: (error: any) => {
            console.error("Error deleting category:", error);
            toast.error("Failed to delete category");
        },
    });
}
