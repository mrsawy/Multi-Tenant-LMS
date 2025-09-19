"use server"

import { getCookie } from "./serverUtils";
import { AUTH_COOKIE_NAME } from "@/middleware";
import { v7 } from "uuid";
import { connectToNats, request } from "@/lib/nats/client";
import NatsError from "../nats/error";


interface NatsRequestPayload<T = any> {
    id: string;
    data: T;
}

// Utility functions
export async function createAuthorizedNatsRequest<T, R = any>(subject: string, data: T): Promise<R> {
    const natsClient = await connectToNats();
    const idToken = await getCookie(AUTH_COOKIE_NAME);

    if (!idToken) {
        throw new Error("Authentication token not found");
    }

    const payload: NatsRequestPayload<T & { authorization: string }> = {
        id: v7(),
        data: {
            authorization: idToken,
            ...data,
        },
    };

    const response = await request<R | { err: NatsError }>(natsClient, subject, JSON.stringify(payload));

    console.dir({ response }, { depth: null })

    if (typeof response === "object" && response !== null && 'err' in response) {
        throw new Error((response as { err: NatsError }).err.message);
    }

    return response;
}


export async function createNatsRequest<T>(subject: string, data: T): Promise<any> {
    const natsClient = await connectToNats();

    const payload: NatsRequestPayload<T> = {
        id: v7(),
        data: {
            ...data,
        },
    };

    const response = await request<any>(natsClient, subject, JSON.stringify(payload));

    if ('err' in response) {
        throw new Error((response as { err: NatsError }).err.message);
    }

    return response;
}