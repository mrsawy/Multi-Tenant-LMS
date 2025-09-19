"use server";

import { ICategory } from "@/lib/types/category/ICategory";
import { PaginationOptions, withDefaults } from "@/lib/types/Paginated";
import { createAuthorizedNatsRequest } from "@/lib/utils/createNatsRequest";



export const createCategory = async (
    options: {
        organizationId: string;
        name: string;
        parentId?: string | null;
    }
) => {
    return createAuthorizedNatsRequest("category.create", options);
};

export const getAllCategories = async (
    options: PaginationOptions<{ organizationId: string }>
) => {
    const payload = withDefaults(options);
    return createAuthorizedNatsRequest("category.getAll", payload);
};

export const getCategory = async (categoryId: string) => {
    return createAuthorizedNatsRequest<{ categoryId: string }, ICategory>("category.getCategory", { categoryId })
}

export const deleteCategory = async (
    options: PaginationOptions<{ organizationId: string; categoryId: string }>
) => {
    const payload = withDefaults(options);
    return createAuthorizedNatsRequest("category.delete", payload);
};

export const updateCategory = async (
    options: PaginationOptions<{ organizationId: string; categoryId: string }>
) => {
    const payload = withDefaults(options);
    return createAuthorizedNatsRequest("category.update", payload);
};
