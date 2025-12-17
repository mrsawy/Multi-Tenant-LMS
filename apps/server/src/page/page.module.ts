import { Module } from '@nestjs/common';
import { PageService } from './page.service';
import { PageControllerMessage } from './page.controller.message';
import { Page, PageSchema } from './entities/page.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
    AuthModule,
  ],
  controllers: [PageControllerMessage],
  providers: [PageService],
})
export class PageModule {}
