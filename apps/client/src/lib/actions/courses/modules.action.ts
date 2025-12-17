"use server";


import { getCookie } from "@/lib/utils/serverUtils";
import { connectToNats, request } from "@/lib/nats/client";
import { ICourse, ICourseWithModules } from "@/lib/types/course/course.interface";
import { v7 } from "uuid";
import NatsError from "@/lib/nats/error";
import { CreateCourseSchema } from "@/lib/schema/course.schema";
import { CreateModuleSchema, UpdateModuleSchema } from "@/lib/schema/module.schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAuthorizedNatsRequest } from "@/lib/utils/createNatsRequest";




function isRedirectError(error: any): boolean {
    return error.digest?.startsWith('NEXT_REDIRECT');
}

async function handlePageRevalidation(): Promise<void> {
    const headersList = await headers();
    const referer = headersList.get('referer');

    if (referer) {
        const url = new URL(referer);
        const pathname = url.pathname;
        revalidatePath(pathname);
    }
}

async function handlePageRevalidationWithRedirect(): Promise<void> {
    const headersList = await headers();
    const referer = headersList.get('referer');

    if (referer) {
        const url = new URL(referer);
        const pathname = url.pathname;
        revalidatePath(pathname);
        redirect(pathname);
    }
}

// Course operations
export async function getCourseWithModules(courseId: string): Promise<ICourseWithModules> {
    try {
        return await createAuthorizedNatsRequest('courses.getCourseWithModule', { courseId });
    } catch (error) {
        console.error("Error from getCourseWithModules:", error);
        throw new Error("Failed to get course with modules");
    }
}

// Module operations
export async function createCourseModule(
    params: CreateModuleSchema & { courseId: string }
): Promise<any> {
    try {
        return await createAuthorizedNatsRequest('course.createModule', params);
    } catch (error: any) {
        if (isRedirectError(error)) {
            return;
        }
        console.error("Error from createCourseModule:", error);
        throw new Error("Failed to create module");
    }
}

export async function getModule(moduleId: string): Promise<any> {
    try {
        return await createAuthorizedNatsRequest('course.getModule', { moduleId });
    } catch (error) {
        console.error("Error from getModule:", error);
        throw new Error("Failed to get module");
    }
}

export async function updateModule(
    moduleId: string,
    updateData: UpdateModuleSchema
): Promise<any> {
    try {
        const response = await createAuthorizedNatsRequest('course.updateModule', {
            moduleId,
            data: updateData,
        });

        await handlePageRevalidationWithRedirect();
        return response;
    } catch (error: any) {
        if (isRedirectError(error)) {
            return;
        }
        console.error("Error from updateModule:", error);
        throw new Error("Failed to update module");
    }
}

export async function deleteModule(moduleId: string): Promise<any> {
    try {
        const response = await createAuthorizedNatsRequest('course.deleteModule', { moduleId });
        await handlePageRevalidation();
        return response;
    } catch (error) {
        console.error("Error from deleteModule:", error);
        throw new Error("Failed to delete module");
    }
}

export async function deleteModules(moduleIds: string[]): Promise<any> {
    try {
        const response = await createAuthorizedNatsRequest('course.deleteModules', { moduleIds });
        await handlePageRevalidation();
        return response;
    } catch (error) {
        console.error("Error from deleteModules:", error);
        throw new Error("Failed to delete modules");
    }
}

// TODO: Implement reorderCourseModules with NATS
export async function reorderCourseModules(
    courseId: string,
    newOrder: string[]
): Promise<string> {
    // Placeholder implementation - needs to be implemented with NATS
    console.warn("reorderCourseModules not yet implemented with NATS");
    return "Module reordering not implemented";
}