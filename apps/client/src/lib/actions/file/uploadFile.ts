
import { getPresignedUrl } from "./getPreSignedUrl";
import { getAuthUser } from "../user/user.action";
import { v7 } from "uuid";
import { slugify } from "@/lib/utils/slugify";

export interface UploadFileOptions {
    file: File;
    fileKey?: string;
    isPublic?: boolean;
    customPath?: string;
}

/**
 * Uploads a file to S3 using presigned URL
 * @param options - Upload options including file, optional fileKey, isPublic flag, and custom path
 * @returns The fileKey of the uploaded file
 * @throws Error if upload fails
 */
export async function uploadFileToS3({
    file,
    fileKey,
    isPublic = false,
    customPath,
}: UploadFileOptions): Promise<string> {
    try {
        const user = await getAuthUser();
        if (!user) {
            throw new Error("User not authenticated");
        }

        // Generate fileKey if not provided
        let finalFileKey = fileKey;
        if (!finalFileKey) {
            // Extract file extension and base name
            const lastDotIndex = file.name.lastIndexOf('.');
            const fileExtension = lastDotIndex > 0 ? file.name.slice(lastDotIndex + 1) : '';
            const baseFileName = lastDotIndex > 0 ? file.name.slice(0, lastDotIndex) : file.name;
            const slugifiedBaseName = slugify(baseFileName);

            // Construct filename with extension
            const fileName = fileExtension ? `${slugifiedBaseName}.${fileExtension}` : slugifiedBaseName;

            if (customPath) {
                finalFileKey = `${customPath}/${v7()}_${fileName}`;
            } else {
                // Default path structure
                finalFileKey = `${user.organization?.slug}/files/${v7()}_${fileName}`;
            }
        }

        // Get presigned URL
        const preSignedUrl = await getPresignedUrl({
            fileType: file.type,
            fileSize: file.size,
            fileKey: finalFileKey,
            isPublic,
        });

        if (!preSignedUrl) {
            throw new Error("Failed to get presigned URL");
        }

        // Upload file to S3
        const response = await fetch(preSignedUrl, {
            method: "PUT",
            headers: {
                "Content-Type": file.type,
            },
            body: file,
        });

        if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.statusText}`);
        }

        return finalFileKey;
    } catch (error: any) {
        console.error("Error uploading file:", error);
        throw new Error(error.message || "Failed to upload file");
    }
}
