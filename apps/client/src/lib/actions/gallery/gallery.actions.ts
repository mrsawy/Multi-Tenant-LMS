
'use server';

import { getCookie } from '@/lib/utils/serverUtils';
import { connectToNats, request } from '@/lib/nats/client';
import { v7 as uuidv7 } from 'uuid';
import { NatsError } from 'nats';
import { AUTH_COOKIE_NAME } from '@/lib/data/constants';

interface PresignedUrlResponse {
    uploadUrl: string;
    fileKey: string;
    expiresAt: string;
}

interface GalleryItem {
    _id: string;
    userId: string;
    url: string;
    fileKey: string;
    type: string;
    title?: string;
    isPublic: boolean;
    createdAt: string;
}

export async function generateGalleryPresignedUrl(fileType: string, fileSize: number, fileName: string) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<PresignedUrlResponse>(
            natsClient,
            'gallery.generatePresignedUrl',
            JSON.stringify({
                id: uuidv7(),
                data: {
                    authorization: idToken,
                    fileType,
                    fileSize,
                    fileName,
                    isPublic: true
                }
            }),
        );

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message);
        }

        return response;
    } catch (error) {
        console.error("error from generateGalleryPresignedUrl:", error);
        throw new Error("Failed to generate upload URL");
    }
}

export async function createGalleryItem(data: { url: string; fileKey: string; type?: string; title?: string; isPublic?: boolean }) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<GalleryItem>(
            natsClient,
            'gallery.create',
            JSON.stringify({
                id: uuidv7(),
                data: {
                    authorization: idToken,
                    ...data
                }
            }),
        );

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message);
        }

        return response;
    } catch (error) {
        console.error("error from createGalleryItem:", error);
        throw new Error("Failed to save gallery item");
    }
}


export async function getGalleryItems(page: number = 1, limit: number = 10) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<any>(
            natsClient,
            'gallery.findAll',
            JSON.stringify({
                id: uuidv7(),
                data: {
                    authorization: idToken,
                    page,
                    limit
                }
            }),
        );

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message);
        }

        return response;
    } catch (error) {
        console.error("error from getGalleryItems:", error);
        throw new Error("Failed to fetch gallery items");
    }
}

export async function deleteGalleryItem(galleryId: string) {
    try {
        const natsClient = await connectToNats();
        const idToken = await getCookie(AUTH_COOKIE_NAME);

        const response = await request<{ success: boolean; deletedId: string }>(
            natsClient,
            'gallery.delete',
            JSON.stringify({
                id: uuidv7(),
                data: {
                    authorization: idToken,
                    galleryId
                }
            }),
        );

        if ('err' in response) {
            throw new Error((response as { err: NatsError }).err.message);
        }

        return response;
    } catch (error) {
        console.error("error from deleteGalleryItem:", error);
        throw new Error("Failed to delete gallery item");
    }
}