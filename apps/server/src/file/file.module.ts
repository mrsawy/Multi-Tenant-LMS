import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileService } from './file.service';
import { ConfigService } from '@nestjs/config';
import { FileController } from './file.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: async () => {
        return {
          storage: memoryStorage(),
          limits: {
            fileSize: 5 * 1024 * 1024, // 10MB max file size
          },
        };
      },
    }),
    AuthModule,
  ],
  providers: [FileService],
  controllers: [FileController],
  exports: [MulterModule, FileService],
})
export class FileModule { }
