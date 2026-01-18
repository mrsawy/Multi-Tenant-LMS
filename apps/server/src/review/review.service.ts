import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, MongooseBaseQueryOptions, PaginateModel, PaginateOptions, RootFilterQuery, Types } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { Review } from './entities/review.entity';
import { ReviewType } from './enum/reviewType.enum';
import { String } from 'aws-sdk/clients/rdsdataservice';
import { convertObjectValuesToObjectId, convertToObjectId } from 'src/utils/ObjectId.utils';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<Review> & PaginateModel<Review>,
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
    if (existingReview) {
      return await existingReview.updateOne({
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      })
    }

    const review = new modelToUse(createReviewDto);
    return await review.save();
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

    return updatedReview;
  }

  async remove(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid review ID');
    }

    const review = await this.reviewModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return { message: 'Review deleted successfully', review };
  }

  async getAverageRating(filter: Partial<GetReviewsDto>) {
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
}
