"use server";

import { AUTH_COOKIE_NAME } from "@/middleware";
import { deleteFromS3, getCookie } from "@/lib/utils/serverUtils";
import { connectToNats, request } from "@/lib/nats/client";
import { v7 } from "uuid";
import NatsError from "@/lib/nats/error";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CourseContentFormData } from "@/lib/schema/content.schema";
import { CourseContentType } from "@/lib/types/course/enum/CourseContentType.enum";
import { VideoType } from "@/lib/types/course/enum/VideoType.enum";
import { IModuleWithContents } from "@/lib/types/course/modules.interface";
import { IContent } from "@/lib/types/course/content.interface";

export async function createContent(moduleId: string, courseId: string, data: CourseContentFormData, fileKey?: string) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);
        if (!idToken) throw new Error("No Token Provided")
        const { content, ...baseData } = data
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

        revalidatePath(`/organization-dashboard/courses/${courseId}/modules/${moduleId}/content`);
        return { success: true, redirectPath: `/organization-dashboard/courses/${courseId}/modules/${moduleId}/content` };

    } catch (error: any) {
        console.error("error from createContent:", error)

        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            return
        }
        console.error("error from createContent:", error)
        if (fileKey) await deleteFromS3(fileKey);
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


export async function getContentsByModuleId(moduleId: string) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<IModuleWithContents>(
            natsClient,
            'course.getContentsByModuleId',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    moduleId
                }
            }),
        );

        console.dir({ response }, { depth: null })

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        return response
    } catch (error) {
        console.error("error from getContent:", error)
        throw new Error("Failed to get content")
    }
}


export async function deleteContentById(contentId: string) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<IModuleWithContents>(
            natsClient,
            'course.deleteContent',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    contentId
                }
            }),
        );

        console.dir({ response }, { depth: null })

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        return response
    } catch (error) {
        console.error("error from getContent:", error)
        throw new Error("Failed to get content")
    }
}


export async function updateContent(contentId: string, updatedData: Partial<IContent>) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        console.log({ updatedData })

        const response = await request<any>(
            natsClient,
            'course.updateContent',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    contentId,
                    ...updatedData
                }
            }),
        );

        console.dir({ response }, { depth: null })

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }

        return response
    } catch (error) {
        console.error("error from getContent:", error)
        throw new Error("Failed to get content")
    }
}
// export async function updateContent(contentId: string, updateData: Partial<CreateContentSchema>) {
//     try {
//         const natsClient = await connectToNats();
//         const idToken = await getCookie(AUTH_COOKIE_NAME);

//         const response = await request<any>(
//             natsClient,
//             'course.updateContent',
//             JSON.stringify({
//                 id: v7(),
//                 data: {
//                     authorization: idToken,
//                     contentId,
//                     ...updateData
//                 }
//             }),
//         );

//         if ('err' in response) {
//             throw new Error((response as { err: NatsError }).err.message)
//         }

//         const headersList = await headers();
//         const referer = headersList.get('referer');

//         if (referer) {
//             const url = new URL(referer);
//             const pathname = url.pathname;
//             revalidatePath(pathname);
//             redirect(pathname)
//         }

//         return response
//     } catch (error: any) {
//         if (error.digest?.startsWith('NEXT_REDIRECT')) {
//             return
//         }
//         console.error("error from updateContent:", error)
//         throw new Error("Failed to update content")
//     }
// }
