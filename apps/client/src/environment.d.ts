declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production' | 'test';

            // Auth
            AUTH_EXPIRES_IN: string;

            // AWS S3
            NEXT_PUBLIC_S3_BUCKET_NAME: string;
            NEXT_PUBLIC_S3_REGION: string;
            AWS_ACCESS_KEY_ID: string;
            AWS_SECRET_ACCESS_KEY: string;

            // Email
            RESEND_API_KEY?: string;

            // NATS
            NATS_URLS: string;

            // Redis
            REDIS_URL: string;
        }
    }
}

export { };