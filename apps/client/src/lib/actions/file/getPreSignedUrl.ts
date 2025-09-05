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

export async function getPresignedUrl({ fileType, fileSize, fileKey }: { fileType: string, fileSize: number, fileKey: string }) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);
        if (!idToken) throw new Error("No Token Provided")

        const response = await request<any>(
            natsClient,
            'file.getPreSignedUrl',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    fileType, fileSize, fileKey
                }
            }),
        );
        console.dir({ response }, { depth: null })
        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }
        // Return the presigned URL from the response
        return response.uploadUrl;

    } catch (error: any) {
        if (error.digest?.startsWith('NEXT_REDIRECT')) {
            return
        }
        console.error("error from getPresignedUrl:", error)
        throw new Error("Failed to get presigned URL")
    }
}