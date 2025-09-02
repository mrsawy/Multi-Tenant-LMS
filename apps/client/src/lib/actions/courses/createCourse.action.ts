"use server"

import { CreateCourseSchema } from "@/lib/schema/course.schema"
import { connectToNats, request } from '@/lib/nats/client';
import { v7 } from "uuid";
import { uploadFile } from "@/lib/utils/uploadFile";
import { slugify } from "@/lib/utils/slugify";


export const handleCreateCourse = async (courseData: CreateCourseSchema) => {
    try {

        // TODO: Implement course creation API call
        const natsClient = await connectToNats();

        if (courseData.thumbnail instanceof File) {
            const thumbnailUrl = await uploadFile(
                await courseData.thumbnail.arrayBuffer(),
                `${slugify(courseData.name)}_thumbnail.${courseData.thumbnail.type}`,
                courseData.thumbnail.type,
            );
        }

        const response = await request<any>(
            natsClient,
            'course.createCourse',
            JSON.stringify({
                id: v7(),
                data: courseData,
            }),
        );

        console.log({ response })

    } catch (error) {
        console.error(error)
    }

}

