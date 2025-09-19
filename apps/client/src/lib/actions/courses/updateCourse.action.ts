"use server"

import { CreateCourseSchema } from "@/lib/schema/course.schema"
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from "uuid";
import { uploadFile } from "@/lib/utils/uploadFile";
import { slugify } from "@/lib/utils/slugify";
import { AUTH_COOKIE_NAME } from "@/middleware";
import { getCookie, deleteFromS3 } from "@/lib/utils/serverUtils";
import { getAuthUser } from "../user/user.action";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const handleUpdateCourse = async (courseId: string, formData: FormData) => {
    const courseData: any = {};
    for (const [key, value] of formData.entries()) {
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                courseData[key] = parsed;
            } catch {
                courseData[key] = value;
            }
        } else {
            courseData[key] = value;
        }
    }
    
    const idToken = await getCookie(AUTH_COOKIE_NAME);
    if (!idToken) throw new Error("Invalid Token")

    const user = await getAuthUser()
    if (!user) throw new Error("User Not Found")

    const natsClient = await connectToNats();
    let uploadedThumbnailKey: string | undefined;
    
    try {
        if (courseData.thumbnail instanceof File) {
            const fileExtension = courseData.thumbnail.name.split('.').pop() || 'jpg';
            const thumbnailUrl = await uploadFile(
                await courseData.thumbnail.arrayBuffer(),
                `${user?.organization?.name}/courses/${courseData.name}/${slugify(courseData.name)}_${v7()}_thumbnail.${fileExtension}`,
                courseData.thumbnail.type,
            );
            courseData.thumbnailKey = thumbnailUrl;
            uploadedThumbnailKey = thumbnailUrl;
            delete courseData.thumbnail;
        }

        const response = await request<any>(
            natsClient,
            'course.updateCourse',
            JSON.stringify({
                id: v7(),
                data: {
                    ...courseData,
                    courseId,
                    authorization: idToken
                },
            }),
        );

        if ('err' in response) {
            console.dir({ response }, { depth: null })
            if (uploadedThumbnailKey) await deleteFromS3(uploadedThumbnailKey);
            throw new Error(response.err.message)
        }

        // Revalidate and redirect
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
        if (uploadedThumbnailKey) await deleteFromS3(uploadedThumbnailKey);
        throw error;
    }
}
