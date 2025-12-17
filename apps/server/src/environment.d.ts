declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'DEVELOPMENT' | 'PRODUCTION' | string;

      PORT: string;

      MONGODB_URI_DEV: string;
      MONGODB_URI_PROD: string;

      REDIS_UR_DEV: string;
      REDIS_UR_PROD: string;

      JSON_PRIVATE_KEY: string;

      BASE_URL: string;
      SECURED_BASE_URL: string;
      SECURED_CLIENT_BASE_URL: string;

      CLIENT_BASE_URL: string;
      S3_BUCKET_NAME: string;
      AWS_REGION: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;

      BASE_PAYMOB: string;
      PAYMOB_API_KEY: string;
      PUBLIC_KEY: string;

      MOTO_INTEGRATION_ID: string;
      S_INTEGRATION_ID: string;
      PAYMOB_SECRET_KEY: string;
      PAYMOB_ISLIVE: string;
      WALLET_INTEGRATION: string;

      PAYPAL_BASE_URL: string;
      PAYPAL_CLIENT_ID: string;
      PAYPAL_SECRET: string;

      HOST_URL: string;

      EXCHANGE_RATES_URL: string;
      PAYMOB_BASEURL: string;
      PAYMOB_IS_LIVE: boolean;
      NATS_URLS: string;


      KASHIER_BASE_URL: string;
      KASHIER_MERCHANT_ACCOUNT_ID: string;
      KASHIER_API_KEY: string;
      KASHIER_SECRET_KEY: string;
      KASHIER_TEST_URL: string
      KASHIER_PAYMENT_API_KEY: string
    }
  }
}

export { };
