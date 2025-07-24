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
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule { }
