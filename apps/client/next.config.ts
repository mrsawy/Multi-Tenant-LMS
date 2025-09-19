import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '3mb',
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: `${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com`,
            },
        ],
    },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);








