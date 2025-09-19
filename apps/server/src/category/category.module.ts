import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryHttpController } from './category.controller.http';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './entities/category.entity';
import { CategoryMessageController } from './category.controller.message';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    AuthModule
  ],
  controllers: [CategoryHttpController , CategoryMessageController],
  providers: [CategoryService],
})
export class CategoryModule { }
