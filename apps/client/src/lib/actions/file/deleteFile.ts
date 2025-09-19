
"use server";

import { AUTH_COOKIE_NAME } from "@/middleware";
import { getCookie } from "@/lib/utils/serverUtils";
import { connectToNats, request } from "@/lib/nats/client";
import { v7 } from "uuid";
import NatsError from "@/lib/nats/error";

export const deleteS3File = async (fileKey:string) => {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);
        if (!idToken) throw new Error("No Token Provided")

        const response = await request<any>(
            natsClient,
            'file.deleteFile',
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

        console.error("error from delete File:", error)
        throw new Error("Failed to delete File")
    }


}