console.log('main.ts file loaded');
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  console.log('Starting bootstrap...');
  const app = await NestFactory.create(AppModule);
  // Only use GlobalExceptionFilter - it's the proper NestJS way to handle errors
  app.useGlobalFilters(new GlobalExceptionFilter());

  console.log('Nest application created.');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  if (process.env.NATS_URLS) {
    try {
      const microservice = app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.NATS,
        options: {
          servers: (process.env.NATS_URLS as string)
            .split(',')
            .filter((server) => server.trim().length > 0),
          queue: 'lms',
          debug: true,

        },

      });

      // CRITICAL: Apply interceptor BEFORE startAllMicroservices()
      const { ErrorHandlerInterceptor } = await import('./utils/interceptors/errorHandler.interceptor');
      microservice.useGlobalInterceptors(new ErrorHandlerInterceptor());

      await app.startAllMicroservices();
      console.log('Microservices started successfully');
    } catch (error) {
      console.error('Failed to start microservices:', error);
    }
  } else {
    console.log('NATS_URLS not configured, skipping microservices setup');
  }




  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
