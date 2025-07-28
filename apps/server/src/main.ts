import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import bodyParser from 'body-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  console.log('Server is ruddddddddnning on port:', process.env.PORT ?? 3000);

  // app.use(bodyParser.json());
  // app.use(bodyParser.urlencoded({ extended: true }));


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
// mongodb://localhost:27017/?replicaSet=rs1&directConnection=true
// 