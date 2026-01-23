"use server";


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
import { AUTH_COOKIE_NAME } from "@/lib/data/constants";
import { createAuthorizedNatsRequest } from "@/lib/utils/createNatsRequest";
import { SubmitQuizDto, SubmitQuizResponse } from "@/lib/types/course/DTO/quizSubmission.dto";

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
    return await createAuthorizedNatsRequest('course.getContent', { contentId })
}


export async function getContentsByModuleId(moduleId: string) {
    return await createAuthorizedNatsRequest('course.getContentsByModuleId', { moduleId })
}


export async function deleteContentById(contentId: string) {
    return await createAuthorizedNatsRequest('course.deleteContent', { contentId })
}


export async function updateContent(contentId: string, updatedData: Partial<IContent>) {
    return await createAuthorizedNatsRequest('course.updateContent', { contentId, ...updatedData })
}




export async function submitQuizAction(submission: SubmitQuizDto): Promise<SubmitQuizResponse> {
    return await createAuthorizedNatsRequest<SubmitQuizResponse, SubmitQuizDto>('enrollment.submitQuiz', submission)
}
