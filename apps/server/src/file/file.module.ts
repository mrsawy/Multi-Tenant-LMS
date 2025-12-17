import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FileService } from './file.service';
import { ConfigService } from '@nestjs/config';
import { FileHttpController } from './file.controller.http';
import { AuthModule } from 'src/auth/auth.module';
import { FileMessageController } from './file.controller.message';

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: async () => {
        return {
          storage: memoryStorage(),
          limits: {
            fileSize: 10 * 1024 * 1024, // 10MB max file size
          },
        };
      },
    }),
    forwardRef(() => AuthModule),
  ],
  providers: [FileService],
  controllers: [FileHttpController, FileMessageController],
  exports: [MulterModule, FileService],
})
export class FileModule { }
