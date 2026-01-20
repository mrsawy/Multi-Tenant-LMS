"use server";


import { getCookie } from "@/lib/utils/serverUtils";
import { connectToNats, request } from "@/lib/nats/client";
import { v7 } from "uuid";
import NatsError from "@/lib/nats/error";
import { AUTH_COOKIE_NAME } from "@/lib/data/constants";

export async function getPresignedUrl({ fileType, fileSize, fileKey, isPublic = false }: { fileType: string, fileSize: number, fileKey: string, isPublic?: boolean }) {
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
                    fileType, fileSize, fileKey, isPublic
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


export async function getFileUrl({ fileKey }: { fileKey: string }) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);
        if (!idToken) throw new Error("No Token Provided")

        const response = await request<any>(
            natsClient,
            'file.getFileUrl',
            JSON.stringify({
                id: v7(),
                data: {
                    authorization: idToken,
                    fileKey
                }
            }),
        );
        console.dir({ response }, { depth: null })

        if (typeof response == "object" && 'err' in response) {
            throw new Error((response as { err: NatsError }).err.message)
        }
        // Return the presigned URL from the response
        return response;

    } catch (error: any) {

        console.error("error from FileUrl:", error)
        throw new Error("Failed to get FileUrl URL")
    }
}