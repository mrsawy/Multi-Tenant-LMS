import {
  connect,
  NatsConnection,
  NatsError,
  Payload,
  RequestOptions,
} from 'nats';
import pRetry from 'p-retry';
let client: Awaited<ReturnType<typeof connect>>;

export async function connectToNats() {
  if (!client) {
    const natsUrls = process.env.NATS_URLS;
    if (!natsUrls) {
      throw new Error('NATS_URLS environment variable is not set');
    }
    
    const servers = natsUrls.split(',').filter(
      (server) => server.trim() !== '',
    );
    
    if (servers.length === 0) {
      throw new Error('No valid NATS servers found in NATS_URLS');
    }
    
    console.log('Connecting to NATS servers:', servers);
    
    try {
      client = await connect({ servers });
      console.log('Successfully connected to NATS');
    } catch (error) {
      console.error('Failed to connect to NATS:', error);
      throw error;
    }
  }

  return client;
}

export async function request<T>(
  client: NatsConnection,
  subject: string,
  payload: Payload,
  opts?: RequestOptions,
): Promise<T | { err: NatsError }> {
  const response = await pRetry(
    () =>
      client.request(subject, payload, {
        timeout: 5000,
        ...opts,
      }),
    {
      retries: 3,
      shouldRetry: (error) => (error as unknown as NatsError).code === '503',
      onFailedAttempt: console.error,
    },
  );
  const jsonResponse = response.json<{ err?: NatsError; response: T }>();
  if (jsonResponse.err) {
    console.error(subject, 'failed with', jsonResponse.err);
    return jsonResponse as { err: NatsError };
  }
  return jsonResponse.response;
}
