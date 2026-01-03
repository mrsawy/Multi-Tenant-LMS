import { forwardRef, Module } from '@nestjs/common';
import { CourseService } from './services/course.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './entities/course.entity';
import {
  CourseContent,
  CourseContentSchema,
} from './entities/course-content.entity';
import { ContentType } from './enum/contentType.enum';
import { VideoSchema } from './entities/video.schema';
import { ArticleSchema } from './entities/article.schema';
import { QuizSchema } from './entities/quiz.schema';
import { AssignmentSchema } from './entities/assignment.schema';
import { ProjectSchema } from './entities/project.schema';
import { LiveSessionSchema } from './entities/liveSession.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CaslAbilityFactory } from 'src/role/permissions.factory';
import { RoleModule } from 'src/role/role.module';
import { UserModule } from 'src/user/user.module';
import { CourseContentService } from './services/courseContent.service';
import { FileModule } from 'src/file/file.module';
import { CurrencyModule } from 'src/currency/currency.module';
import { CourseModulesService } from './services/courseModules.service';
import {
  CourseModuleSchema, CourseModuleEntity,
} from './entities/course-module.entity';
import { CategoryModule } from 'src/category/category.module';
import { ContentControllerMessage } from './controller/content.controller.message';
import { QuizService } from './services/quiz.service';
import { ProjectService } from './services/project.service';
import { LiveSessionService } from './services/liveSession.service';
import { Enrollment } from 'src/enrollment/entities/enrollment.entity';
import { EnrollmentModule } from 'src/enrollment/enrollment.module';
import { CourseControllerMessage } from './controller/course.controller.message';
import { ModuleControllerMessage } from './controller/module.controller.message';
import { CourseControllerHttp } from './controller/course.controller.http';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: 'CourseModule', schema: CourseModuleSchema },
      {
        name: CourseContent.name,
        schema: CourseContentSchema,
        discriminators: [
          { name: ContentType.VIDEO, schema: VideoSchema },
          { name: ContentType.ARTICLE, schema: ArticleSchema },
          { name: ContentType.QUIZ, schema: QuizSchema },
          { name: ContentType.ASSIGNMENT, schema: AssignmentSchema },
          { name: ContentType.PROJECT, schema: ProjectSchema },
          { name: ContentType.LIVE_SESSION, schema: LiveSessionSchema },

          // { name: CourseType.DISCUSSION, schema: DiscussionSchema },
        ],
      },
    ]),
    forwardRef(() => AuthModule),
    RoleModule,
    forwardRef(() => UserModule),
    FileModule,
    CurrencyModule,
    // forwardRef(() => CategoryModule),
    CategoryModule,

  ],
  controllers: [
    CourseControllerHttp,
    CourseControllerMessage,
    ContentControllerMessage,
    ModuleControllerMessage,

  ],
  providers: [
    CourseService,
    CourseContentService,
    CourseModulesService,
    QuizService,
    ProjectService,
    LiveSessionService,
  ],
  exports: [
    CourseService,
    QuizService,
    ProjectService,
    LiveSessionService
  ],
})
export class CourseModule { }
