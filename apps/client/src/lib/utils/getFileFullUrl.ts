export function getFileFullUrl(fileKey?: string) {
    if (!fileKey) {
        return '';
    }

    // Check if it's already a valid URL (contains http:// or https://)
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
        return fileKey;
    }

    // If not a valid URL, construct S3 URL
    const fullUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/` + fileKey;
    return fullUrl;
}