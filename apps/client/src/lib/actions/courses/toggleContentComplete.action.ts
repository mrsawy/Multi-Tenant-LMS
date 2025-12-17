"use server";

import { IEnrollment } from "@/lib/types/enrollment/enrollment.interface";
import { createAuthorizedNatsRequest } from "@/lib/utils/createNatsRequest";
import { revalidateTag } from "next/cache";



export const toggleContentComplete = async ({ enrollmentId, contentId, completed }: { enrollmentId: string, contentId: string, completed: boolean }) => {
    const { message } = await createAuthorizedNatsRequest("enrollment.toggleContentComplete", { enrollmentId, contentId, completed }) as { message: string }
    return message
}