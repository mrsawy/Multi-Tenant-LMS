import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, MongooseBaseQueryOptions, PaginateModel, PaginateOptions, RootFilterQuery, Types } from 'mongoose';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { GetReviewsDto } from '../dto/get-reviews.dto';
import { Review } from '../entities/review.entity';
import { ReviewType } from '../enum/reviewType.enum';
import { String } from 'aws-sdk/clients/rdsdataservice';
import { convertObjectValuesToObjectId, convertToObjectId } from 'src/utils/ObjectId.utils';
import { User } from 'src/user/entities/user.entity';
import { Organization } from 'src/organization/entities/organization.entity';
import { Course } from 'src/course/entities/course.entity';
import { CourseModuleEntity } from 'src/course/entities/course-module.entity';
import { CourseContent } from 'src/course/entities/course-content.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<Review> & PaginateModel<Review>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
    @InjectModel(Course.name)
    private courseModel: Model<Course>,
    @InjectModel('CourseModule')
    private courseModuleModel: Model<CourseModuleEntity>,
    @InjectModel(CourseContent.name)
    private courseContentModel: Model<CourseContent>,
  ) { }

  async create(createReviewDto: CreateReviewDto & { userId: string }) {
    for (const key in createReviewDto) {
      const value = createReviewDto[key];
      if (typeof value == "string" && Types.ObjectId.isValid(value)) {
        createReviewDto[key] = convertToObjectId(value as string);
      }
    }
    const { reviewType, ...baseData } = createReviewDto;
    let modelToUse: Model<Review> & PaginateModel<Review> = this.reviewModel;
    if (
      this.reviewModel.discriminators &&
      this.reviewModel.discriminators[reviewType]
    ) {
      modelToUse = this.reviewModel.discriminators[reviewType] as Model<Review> & PaginateModel<Review>;
    }
    const filter = this.buildReviewFilter(createReviewDto);
    const existingReview = await this.reviewModel.findOne(filter);

    let savedReview: Review | null;
    if (existingReview) {
      savedReview = await modelToUse.findByIdAndUpdate(
        existingReview._id,
        {
          $set: {
            rating: baseData.rating,
            comment: baseData.comment,
          },
        },
        { new: true }
      );

      // Update entity ratings based on review type
      await this.updateEntityRatings(reviewType, createReviewDto);
    } else {
      const review = new modelToUse(createReviewDto);
      savedReview = await review.save();

      // Update entity ratings based on review type
      await this.updateEntityRatings(reviewType, createReviewDto);
    }

    return savedReview;
  }

  async findAll(getReviewsDto: GetReviewsDto) {
    let {
      page = 1,
      limit = 10,
      minRating,
      maxRating,
      ...filters
    } = getReviewsDto;

    let query: PaginateOptions & RootFilterQuery<Review> = convertObjectValuesToObjectId({ ...filters, page, limit, isActive: true });

    // Rating range filter
    if (minRating || maxRating) {
      query.rating = {};
      if (minRating) query.rating.$gte = minRating;
      if (maxRating) query.rating.$lte = maxRating;
    }

    const options: PaginateOptions = {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: 'user', select: 'username email firstName lastName avatar' },
      ],
    };

    return await this.reviewModel.paginate(query, options);
  }

  async findOne(id: string) {
    const review = await this.reviewModel
      .findById(id)
      .populate('user', 'username email firstName lastName avatar')
      .exec();

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Populate additional fields based on review type
    if (review.reviewType === ReviewType.COURSE) {
      await review.populate('course', 'name thumbnailKey');
      await review.populate('enrollment');
    } else if (review.reviewType === ReviewType.INSTRUCTOR) {
      await review.populate('instructor', 'username firstName lastName avatar');
      const reviewDoc = review.toObject();
      if ('courseId' in reviewDoc && reviewDoc.courseId) {
        await review.populate('course', 'name thumbnailKey');
      }
    } else if (review.reviewType === ReviewType.ORGANIZATION) {
      await review.populate('reviewedOrganization', 'name logo');
    } else if (review.reviewType === ReviewType.MODULE) {
      await review.populate('module', 'title');
    } else if (review.reviewType === ReviewType.CONTENT) {
      await review.populate('content', 'title');
    }

    return review;
  }

  async findOwn(userId: string, filters: { reviewType: ReviewType; courseId?: string; moduleId?: string; contentId?: string; instructorId?: string; reviewedOrganizationId?: string }) {
    // Convert string IDs to ObjectIds
    const query: any = {
      userId: convertToObjectId(userId),
      reviewType: filters.reviewType,
      isActive: true,
    };

    // Add entity-specific filters
    if (filters.courseId) query.courseId = convertToObjectId(filters.courseId);
    if (filters.moduleId) query.moduleId = convertToObjectId(filters.moduleId);
    if (filters.contentId) query.contentId = convertToObjectId(filters.contentId);
    if (filters.instructorId) query.instructorId = convertToObjectId(filters.instructorId);
    if (filters.reviewedOrganizationId) query.reviewedOrganizationId = convertToObjectId(filters.reviewedOrganizationId);

    const review = await this.reviewModel.findOne(query).exec();
    return review; // Returns null if not found
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    const oldRating = review.rating;
    const reviewType = review.reviewType as ReviewType;

    // Use the appropriate discriminator model for update
    let modelToUse: Model<Review> & PaginateModel<Review> = this.reviewModel;
    if (
      this.reviewModel.discriminators &&
      this.reviewModel.discriminators[review.reviewType]
    ) {
      modelToUse = this.reviewModel.discriminators[review.reviewType] as Model<Review> & PaginateModel<Review>;
    }

    const updatedReview = await modelToUse.findByIdAndUpdate(
      id,
      { $set: updateReviewDto },
      { new: true, runValidators: true }
    );

    // Update entity ratings if rating changed
    if (
      updateReviewDto.rating !== undefined &&
      updateReviewDto.rating !== oldRating
    ) {
      const reviewDoc = review.toObject();
      await this.updateEntityRatingsFromReview(reviewType, reviewDoc);
    }

    return updatedReview;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid review ID');
    }

    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    const reviewType = review.reviewType as ReviewType;
    const reviewDoc = review.toObject();

    await this.reviewModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    // Update entity ratings based on review type
    await this.updateEntityRatingsFromReview(reviewType as ReviewType, reviewDoc);

    return { message: 'Review deleted successfully', review };
  }

  async getAverageRatingDetails(filter: Partial<GetReviewsDto>) {
    const query: {
      isActive: boolean;
      reviewType?: ReviewType;
      courseId?: string;
      instructorId?: string;
      reviewedOrganizationId?: string;
      moduleId?: string;
      contentId?: string;
    } = { isActive: true };

    if (filter.reviewType) {
      query.reviewType = filter.reviewType;
    }

    if (filter.courseId) {
      query.courseId = filter.courseId;
    }

    if (filter.instructorId) {
      query.instructorId = filter.instructorId;
    }

    if (filter.reviewedOrganizationId) {
      query.reviewedOrganizationId = filter.reviewedOrganizationId;
    }

    if (filter.moduleId) {
      query.moduleId = filter.moduleId;
    }

    if (filter.contentId) {
      query.contentId = filter.contentId;
    }

    interface AggregateResult {
      _id: null;
      averageRating: number;
      totalReviews: number;
      ratingDistribution: number[];
    }

    const result = await this.reviewModel.aggregate<AggregateResult>([
      { $match: query },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    if (result.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const distribution = result[0].ratingDistribution.reduce((acc: Record<number, number>, rating: number) => {
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
      ratingDistribution: {
        1: distribution[1] || 0,
        2: distribution[2] || 0,
        3: distribution[3] || 0,
        4: distribution[4] || 0,
        5: distribution[5] || 0,
      }
    };
  }

  private buildReviewFilter(dto: CreateReviewDto & { userId: string }) {
    const filter: {
      userId: Types.ObjectId;
      reviewType: ReviewType;
      isActive: boolean;
      courseId?: Types.ObjectId;
      instructorId?: Types.ObjectId;
      reviewedOrganizationId?: Types.ObjectId;
      moduleId?: Types.ObjectId;
      contentId?: Types.ObjectId;
    } = {
      userId: convertToObjectId(dto.userId),
      reviewType: dto.reviewType,
      isActive: true,
    };

    if (dto.reviewType === ReviewType.COURSE && dto.courseId) {
      filter.courseId = convertToObjectId(dto.courseId);
    } else if (dto.reviewType === ReviewType.INSTRUCTOR && dto.instructorId) {
      filter.instructorId = convertToObjectId(dto.instructorId);
    } else if (dto.reviewType === ReviewType.ORGANIZATION && dto.reviewedOrganizationId) {
      filter.reviewedOrganizationId = convertToObjectId(dto.reviewedOrganizationId);
    } else if (dto.reviewType === ReviewType.MODULE && dto.moduleId) {
      filter.moduleId = convertToObjectId(dto.moduleId);
    } else if (dto.reviewType === ReviewType.CONTENT && dto.contentId) {
      filter.contentId = convertToObjectId(dto.contentId);
    }

    return filter;
  }

  /**
   * Routes to the appropriate entity rating update method based on review type
   */
  private async updateEntityRatings(reviewType: ReviewType, createReviewDto: CreateReviewDto & { userId: string }) {
    if (reviewType === ReviewType.INSTRUCTOR && createReviewDto.instructorId) {
      await this.updateUserRatings(convertToObjectId(createReviewDto.instructorId));
    } else if (reviewType === ReviewType.ORGANIZATION && createReviewDto.reviewedOrganizationId) {
      await this.updateOrganizationRatings(convertToObjectId(createReviewDto.reviewedOrganizationId));
    } else if (reviewType === ReviewType.COURSE && createReviewDto.courseId) {
      await this.updateCourseRatings(convertToObjectId(createReviewDto.courseId));
    } else if (reviewType === ReviewType.MODULE && createReviewDto.moduleId) {
      await this.updateCourseModuleRatings(convertToObjectId(createReviewDto.moduleId));
    } else if (reviewType === ReviewType.CONTENT && createReviewDto.contentId) {
      await this.updateCourseContentRatings(convertToObjectId(createReviewDto.contentId));
    }
  }

  /**
   * Routes to the appropriate entity rating update method based on review type from review document
   */
  private async updateEntityRatingsFromReview(reviewType: ReviewType, reviewDoc: any) {
    if (reviewType === ReviewType.INSTRUCTOR && 'instructorId' in reviewDoc && reviewDoc.instructorId) {
      await this.updateUserRatings(reviewDoc.instructorId as Types.ObjectId);
    } else if (reviewType === ReviewType.ORGANIZATION && 'reviewedOrganizationId' in reviewDoc && reviewDoc.reviewedOrganizationId) {
      await this.updateOrganizationRatings(reviewDoc.reviewedOrganizationId as Types.ObjectId);
    } else if (reviewType === ReviewType.COURSE && 'courseId' in reviewDoc && reviewDoc.courseId) {
      await this.updateCourseRatings(reviewDoc.courseId as Types.ObjectId);
    } else if (reviewType === ReviewType.MODULE && 'moduleId' in reviewDoc && reviewDoc.moduleId) {
      await this.updateCourseModuleRatings(reviewDoc.moduleId as Types.ObjectId);
    } else if (reviewType === ReviewType.CONTENT && 'contentId' in reviewDoc && reviewDoc.contentId) {
      await this.updateCourseContentRatings(reviewDoc.contentId as Types.ObjectId);
    }
  }

  /**
   * Updates user ratings and total reviews when instructor reviews are created, updated, or deleted
   * This method recalculates the average rating and total reviews from all active reviews
   * @param instructorId - The ID of the instructor (user) being reviewed
   */
  private async updateUserRatings(instructorId: Types.ObjectId) {
    // Get all active reviews for this instructor
    const reviews = await this.reviewModel.find({
      reviewType: ReviewType.INSTRUCTOR,
      instructorId: instructorId,
      isActive: true,
    });

    // Calculate new average rating and total reviews
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
      : 0;

    // Update the user document
    await this.userModel.findByIdAndUpdate(
      instructorId,
      {
        $set: {
          averageRating: averageRating,
          totalReviews: totalReviews,
        },
      }
    );
  }

  /**
   * Updates organization ratings and total reviews when organization reviews are created, updated, or deleted
   */
  private async updateOrganizationRatings(organizationId: Types.ObjectId) {
    const reviews = await this.reviewModel.find({
      reviewType: ReviewType.ORGANIZATION,
      reviewedOrganizationId: organizationId,
      isActive: true,
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
      : 0;

    await this.organizationModel.findByIdAndUpdate(
      organizationId,
      {
        $set: {
          averageRating: averageRating,
          totalReviews: totalReviews,
        },
      }
    );
  }

  /**
   * Updates course ratings and total reviews when course reviews are created, updated, or deleted
   */
  private async updateCourseRatings(courseId: Types.ObjectId) {
    const reviews = await this.reviewModel.find({
      reviewType: ReviewType.COURSE,
      courseId: courseId,
      isActive: true,
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
      : 0;

    await this.courseModel.findByIdAndUpdate(
      courseId,
      {
        $set: {
          'stats.averageRating': averageRating,
          'stats.totalReviews': totalReviews,
        },
      }
    );

    // Update instructor course ratings
    await this.updateInstructorCourseRatings(courseId);

    // Update organization course-related stats
    await this.updateOrganizationCourseStats(courseId);
  }

  /**
   * Updates organization course-related stats (averageCoursesRating, totalCoursesReviews, totalCourses)
   * when course reviews are created, updated, or deleted
   */
  private async updateOrganizationCourseStats(courseId: Types.ObjectId) {
    // Get the course to find its organizationId
    const course = await this.courseModel.findById(courseId).select('organizationId').exec();

    if (!course || !course.organizationId) {
      return;
    }

    const organizationId = course.organizationId;

    // Get all courses in the organization
    const organizationCourses = await this.courseModel.find({
      organizationId: organizationId,
    }).select('_id').exec();

    const courseIds = organizationCourses.map(c => c._id);
    const totalCourses = courseIds.length;

    if (courseIds.length === 0) {
      // No courses, reset to 0
      await this.organizationModel.findByIdAndUpdate(
        organizationId,
        {
          $set: {
            'stats.averageCoursesRating': 0,
            'stats.totalCoursesReviews': 0,
            'stats.totalCourses': 0,
          },
        }
      );
      return;
    }

    // Get all active course reviews for all courses in the organization
    const allCourseReviews = await this.reviewModel.find({
      reviewType: ReviewType.COURSE,
      courseId: { $in: courseIds },
      isActive: true,
    });

    // Calculate total reviews and average rating across all courses
    const totalCoursesReviews = allCourseReviews.length;
    const averageCoursesRating = totalCoursesReviews > 0
      ? Math.round((allCourseReviews.reduce((sum, review) => sum + review.rating, 0) / totalCoursesReviews) * 10) / 10
      : 0;

    // Update the organization's course-related stats
    await this.organizationModel.findByIdAndUpdate(
      organizationId,
      {
        $set: {
          'stats.averageCoursesRating': averageCoursesRating,
          'stats.totalCoursesReviews': totalCoursesReviews,
          'stats.totalCourses': totalCourses,
        },
      }
    );
  }

  /**
   * Updates instructor course ratings (totalCoursesReviews and averageCoursesRating) 
   * when course reviews are created, updated, or deleted
   * This updates all instructors associated with the course (instructorId + coInstructorsIds)
   */
  private async updateInstructorCourseRatings(courseId: Types.ObjectId) {
    // Get the course to find all instructors
    const course = await this.courseModel.findById(courseId).select('instructorId coInstructorsIds').exec();

    if (!course) {
      return;
    }

    // Collect all instructor IDs (main instructor + co-instructors)
    const instructorIds: Types.ObjectId[] = [];
    if (course.instructorId) {
      instructorIds.push(course.instructorId);
    }
    if (course.coInstructorsIds && course.coInstructorsIds.length > 0) {
      instructorIds.push(...course.coInstructorsIds);
    }

    if (instructorIds.length === 0) {
      return;
    }

    // For each instructor, calculate their course ratings
    for (const instructorId of instructorIds) {
      // Get all courses taught by this instructor
      const instructorCourses = await this.courseModel.find({
        $or: [
          { instructorId: instructorId },
          { coInstructorsIds: instructorId }
        ]
      }).select('_id').exec();

      const courseIds = instructorCourses.map(c => c._id);

      if (courseIds.length === 0) {
        // No courses, reset to 0
        await this.userModel.findByIdAndUpdate(
          instructorId,
          {
            $set: {
              totalCoursesReviews: 0,
              averageCoursesRating: 0,
            },
          }
        );
        continue;
      }

      // Get all active course reviews for all courses taught by this instructor
      const allCourseReviews = await this.reviewModel.find({
        reviewType: ReviewType.COURSE,
        courseId: { $in: courseIds },
        isActive: true,
      });

      // Calculate total reviews and average rating
      const totalCoursesReviews = allCourseReviews.length;
      const averageCoursesRating = totalCoursesReviews > 0
        ? Math.round((allCourseReviews.reduce((sum, review) => sum + review.rating, 0) / totalCoursesReviews) * 10) / 10
        : 0;

      // Update the instructor's course ratings
      await this.userModel.findByIdAndUpdate(
        instructorId,
        {
          $set: {
            totalCoursesReviews: totalCoursesReviews,
            averageCoursesRating: averageCoursesRating,
          },
        }
      );
    }
  }

  /**
   * Updates course module ratings and total reviews when module reviews are created, updated, or deleted
   */
  private async updateCourseModuleRatings(moduleId: Types.ObjectId) {
    const reviews = await this.reviewModel.find({
      reviewType: ReviewType.MODULE,
      moduleId: moduleId,
      isActive: true,
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
      : 0;

    await this.courseModuleModel.findByIdAndUpdate(
      moduleId,
      {
        $set: {
          averageRating: averageRating,
          totalReviews: totalReviews,
        },
      }
    );
  }

  /**
   * Updates course content ratings and total reviews when content reviews are created, updated, or deleted
   */
  private async updateCourseContentRatings(contentId: Types.ObjectId) {
    const reviews = await this.reviewModel.find({
      reviewType: ReviewType.CONTENT,
      contentId: contentId,
      isActive: true,
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
      : 0;

    await this.courseContentModel.findByIdAndUpdate(
      contentId,
      {
        $set: {
          averageRating: averageRating,
          totalReviews: totalReviews,
        },
      }
    );
  }
}
