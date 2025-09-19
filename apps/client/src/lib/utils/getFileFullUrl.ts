export function getFileFullUrl(fileKey: string) {
    const fullUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/` + fileKey;
    return fullUrl;

}