
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { GalleryControllerMessage } from './gallery.controller.message';
import { Gallery, GallerySchema } from './entities/gallery.entity';
import { FileModule } from '../file/file.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gallery.name, schema: GallerySchema }]),
    FileModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [GalleryController, GalleryControllerMessage],
  providers: [GalleryService],
})
export class GalleryModule {}
