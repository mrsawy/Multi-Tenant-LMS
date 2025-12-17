import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewService } from './review.service';
import { ReviewControllerHttp } from './review.controller.http';
import { ReviewControllerMessage } from './review.controller.message';
import { Review, ReviewSchema } from './entities/review.entity';
import { CourseReviewSchema } from './entities/course-review.entity';
import { InstructorReviewSchema } from './entities/instructor-review.entity';
import { OrganizationReviewSchema } from './entities/organization-review.entity';
import { ReviewType } from './enum/reviewType.enum';
import { AuthModule } from 'src/auth/auth.module';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Review.name,
        schema: ReviewSchema,
        discriminators: [
          { name: ReviewType.COURSE, schema: CourseReviewSchema },
          { name: ReviewType.INSTRUCTOR, schema: InstructorReviewSchema },
          { name: ReviewType.ORGANIZATION, schema: OrganizationReviewSchema },
        ],
      },
    ]),
    forwardRef(() => AuthModule),
    RoleModule,
  ],
  controllers: [ReviewControllerHttp, ReviewControllerMessage],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
