import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './entities/course.entity';
import { CourseContent, CourseContentSchema } from './entities/course-content.entity';
import { CourseType } from './enum/courseType.enum';
import { VideoSchema } from './entities/video.schema';
import { ArticleSchema } from './entities/article.schema';
import { QuizSchema } from './entities/quiz.schema';
import { AssignmentSchema } from './entities/assignment.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CaslAbilityFactory } from 'src/role/permissions.factory';
import { RoleModule } from 'src/role/role.module';
import { UserModule } from 'src/user/user.module';
import { CourseContentService } from './courseContent.service';
import { FileModule } from 'src/file/file.module';
import { CurrencyModule } from 'src/currency/currency.module';
// import { NestjsFormDataModule } from 'nestjs-form-data';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      {
        name: CourseContent.name,
        schema: CourseContentSchema,
        discriminators: [
          { name: CourseType.VIDEO, schema: VideoSchema },
          { name: CourseType.ARTICLE, schema: ArticleSchema },
          { name: CourseType.QUIZ, schema: QuizSchema },
          { name: CourseType.ASSIGNMENT, schema: AssignmentSchema },
          // { name: CourseType.PROJECT, schema: ProjectSchema },
          // { name: CourseType.LIVE_SESSION, schema: LiveSessionSchema },
          // { name: CourseType.DISCUSSION, schema: DiscussionSchema },
        ]
      }
    ]),

    AuthModule,
    RoleModule,
    UserModule,
    FileModule,
    CurrencyModule
    // NestjsFormDataModule
  ],
  controllers: [CourseController],
  providers: [

    CourseService
    , CourseContentService
  ],
  exports: [CourseService]
})
export class CourseModule { }
