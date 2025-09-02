import axios from 'axios';
import { getUploadUrl } from './serverUtils';


export const uploadFile = async (
    fileContents: ArrayBuffer,
    fileName: string,
    mimeType: string,
) => {
    const uploadUrl = await getUploadUrl(fileName, mimeType);
    await axios.put(uploadUrl, fileContents, {
        headers: {
            'Content-Type': mimeType,
        },
    });

    return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${fileName}`;
};