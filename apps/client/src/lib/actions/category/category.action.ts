"use server";

import { ICategory } from "@/lib/types/category/ICategory";
import { PaginationOptions, withDefaults } from "@/lib/types/Paginated";
import { createAuthorizedNatsRequest, createNatsRequest } from "@/lib/utils/createNatsRequest";



export const createCategory = async (
    options: {
        organizationId: string;
        name: string;
        parentId?: string | null;
    }
) => {
    return createAuthorizedNatsRequest("category.create", options);
};

export const getAllFlatCategories = async (
    options: PaginationOptions
) => {
    const payload = withDefaults(options);
    return createAuthorizedNatsRequest("category.getAllFlat", payload);
};


export const getAllCategories = async (
    options: PaginationOptions<{ organizationId: string }>
) => {
    const payload = withDefaults(options);
    return createAuthorizedNatsRequest("category.getAll", payload);
};

export const getCategory = async (categoryId: string): Promise<ICategory> => {
    return createAuthorizedNatsRequest<ICategory, { categoryId: string }>("category.getCategory", { categoryId })
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



export const filterCategories = async (
    options: PaginationOptions
) => {
    const payload = withDefaults(options);
    return createNatsRequest("category.filter", payload);
};