import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Check if NATS_URLS is available before setting up microservices
  if (process.env.NATS_URLS) {
    try {
      app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.NATS,
        options: {
          servers: (process.env.NATS_URLS as string).split(',').filter(
            (server) => server.trim().length > 0,
          ),
          queue: 'lms',
          debug: true,
        },
      });
      
      // Start microservices first
      await app.startAllMicroservices();
      console.log('Microservices started successfully');
    } catch (error) {
      console.error('Failed to start microservices:', error);
      // Continue without microservices if they fail to start
    }
  } else {
    console.log('NATS_URLS not configured, skipping microservices setup');
  }
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // if (process.env.NODE_ENV === 'development') {
  //   app.enableCors();
  // }

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
