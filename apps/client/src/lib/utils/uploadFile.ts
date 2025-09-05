import axios from 'axios';
import { getUploadUrl } from './serverUtils';


export const uploadFile = async (
    fileContents: ArrayBuffer,
    fileName: string,
    mimeType: string,
) => {
    try {

        const uploadUrl = await getUploadUrl(fileName, mimeType);
        await axios.put(uploadUrl, fileContents, {
            headers: {
                'Content-Type': mimeType,
            },
        });

        return fileName;
        // https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/
    } catch (error: any) {
        console.error("Error uploading :", error)
        console.dir(error.response, { depth: null })
        throw new Error("Error Uploading", error.message)
    }
};