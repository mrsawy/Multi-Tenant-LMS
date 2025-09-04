"use server";

import { AUTH_COOKIE_NAME } from "@/middleware";
import { getCookie } from "@/lib/utils/serverUtils";
import { connectToNats, request } from "@/lib/nats/client";
import { v7 } from "uuid";
import NatsError from "@/lib/nats/error";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CourseContentFormData } from "@/lib/schema/content.schema";
import { CourseContentType } from "@/lib/types/course/enum/CourseContentType.enum";
import { VideoType } from "@/lib/types/course/enum/VideoType.enum";

export async function createContent(moduleId: string, courseId: string, data: CourseContentFormData) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);
        if (!idToken) throw new Error("No Token Provided")
        const { content, ...baseData } = data

        if (baseData.type == CourseContentType.VIDEO && 'videoType' in content && content.videoType == VideoType.UPLOAD) {
            // Handle video upload logic here
        }

        const response = await request<any>(
            natsClient,
            'course.createContent',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    moduleId, courseId,
                    ...baseData,
                    ...content
                }
            }),
        );
        console.dir({ response }, { depth: null })
        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        // const headersList = await headers();
        // const referer = headersList.get('referer');

        // if (referer) {
        //     const url = new URL(referer);
        //     const pathname = url.pathname;
        //     revalidatePath(pathname);
        //     redirect(pathname)
        // }

        // return response
    } catch (error: any) {
        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            return
        }
        console.error("error from createContent:", error)
        throw new Error("Failed to create content")
    }
}

export async function getContent(contentId: string) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<any>(
            natsClient,
            'course.getContent',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    contentId
                }
            }),
        );

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        return response
    } catch (error) {
        console.error("error from getContent:", error)
        throw new Error("Failed to get content")
    }
}