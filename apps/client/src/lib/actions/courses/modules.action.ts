"use server";

import { AUTH_COOKIE_NAME } from "@/middleware";
import { getCookie } from "@/lib/utils/serverUtils";
import { connectToNats, request } from "@/lib/nats/client";
import { ICourse } from "@/lib/types/course/course.interface";
import { v7 } from "uuid";
import NatsError from "@/lib/nats/error";
import { CreateCourseSchema } from "@/lib/schema/course.schema";
import { CreateModuleSchema, UpdateModuleSchema } from "@/lib/schema/module.schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";


// async function authorizedFetch(input: string, init?: RequestInit) {
//     const token = await getCookie(AUTH_COOKIE_NAME);
//     const headers = new Headers(init?.headers);
//     if (token) headers.set("Authorization", `Bearer ${token}`);
//     headers.set("Content-Type", "application/json");
//     return fetch(input, { ...init, headers, cache: "no-store" });
// }

export async function getCourseWithModules(courseId: string) {
    try {
        const natsClient = await connectToNats();

        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<any>(
            natsClient,
            'courses.getCourseWithModule',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    courseId
                }
            }),
        );

        // console.dir({ response }, { depth: null })

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        return response
    } catch (error) {
        console.error("error frmo getCourses:", error)
        throw new Error()
    }


}

export async function createCourseModule(params: CreateCourseSchema & { courseId: string }): Promise<any> {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);
        const response = await request<any>(
            natsClient,
            'course.createModule',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    ...params
                }
            }),
        );
        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }
        const headersList = await headers();
        const referer = headersList.get('referer');

        console.dir(headersList, { depth: null })

        if (referer) {


            const url = new URL(referer);
            const pathname = url.pathname;
            revalidatePath(pathname);
            console.dir({ referer, pathname }, { depth: null })
            redirect(pathname)
        }
        return
    } catch (error: any) {
        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            return
        }
        console.error("error from createCourseModule:", error)
        throw new Error("Failed to create module")
    }
}


export async function getModule(moduleId: string) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<any>(
            natsClient,
            'course.getModule',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    moduleId
                }
            }),
        );

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        return response
    } catch (error) {
        console.error("error from getModule:", error)
        throw new Error("Failed to get module")
    }
}

export async function updateModule(moduleId: string, updateData: UpdateModuleSchema) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);
        
        const response = await request<any>(
            natsClient,
            'course.updateModule',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    moduleId,
                    data: updateData
                }
            }),
        );
        
        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }
        
        const headersList = await headers();
        const referer = headersList.get('referer');

        if (referer) {
            const url = new URL(referer);
            const pathname = url.pathname;
            revalidatePath(pathname);
            redirect(pathname)
        }
        
        return response
    } catch (error: any) {
        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            return
        }
        console.error("error from updateModule:", error)
        throw new Error("Failed to update module")
    }
}

export async function reorderCourseModules(courseId: string, newOrder: string[]) {
    // const res = await authorizedFetch(`${SERVER_URL}/course/${courseId}/reorder`, {
    //     method: "PATCH",
    //     body: JSON.stringify({ newOrder }),
    // });
    // if (!res.ok) throw new Error("Failed to reorder modules");
    return "await res.json()";
}


