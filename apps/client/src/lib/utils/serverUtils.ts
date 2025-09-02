'use server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';


export async function getCookie(name: string) {
    return (await cookies()).get(name)?.value;
}
export async function setCookie(
    name: string,
    value: string,
    config?: Partial<ResponseCookie>,
) {
    return (await cookies()).set(name, value, config);
}
export async function removeCookie(name: string) {
    return (await cookies()).delete(name);
}

/**
 * Function to get upload url to upload to S3
 *
 * @param fileName - the name of the file
 *
 * @param mimeType - mime type
 *
 * @returns the url to upload to
 */
export async function getUploadUrl(fileName: string, mimeType: string) {
    const s3Client = new S3Client({
        region: process.env.NEXT_PUBLIC_S3_REGION,
    });

    const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
        Key: fileName,
        ContentType: mimeType,
    };

    const command = new PutObjectCommand(params);
    return await getSignedUrl(s3Client as any, command as any);
}
