import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PaginateModel, PaginateOptions, Types } from 'mongoose';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { Review } from './entities/review.entity';
import { ReviewType } from './enum/reviewType.enum';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private reviewModel: Model<Review> & PaginateModel<Review>,
  ) { }

  async create(createReviewDto: CreateReviewDto) {
    const { reviewType, ...baseData } = createReviewDto;

    let modelToUse: Model<Review> & PaginateModel<Review> = this.reviewModel;

    // Use discriminator model if available
    if (
      this.reviewModel.discriminators &&
      this.reviewModel.discriminators[reviewType]
    ) {
      modelToUse = this.reviewModel.discriminators[reviewType] as Model<Review> & PaginateModel<Review>;
    }

    // Check if user already reviewed this entity
    const filter: {
      userId: string;
      reviewType: ReviewType;
      isActive: boolean;
      courseId?: string;
      instructorId?: string;
      reviewedOrganizationId?: string;
    } = this.buildReviewFilter(createReviewDto);
    const existingReview = await this.reviewModel.findOne(filter);

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this entity');
    }

    const review = new modelToUse(createReviewDto);
    return await review.save();
  }

  async findAll(getReviewsDto: GetReviewsDto) {
    const {
      page = 1,
      limit = 10,
      minRating,
      maxRating,
      ...filters
    } = getReviewsDto;

    const query: {
      isActive: boolean;
      reviewType?: ReviewType;
      userId?: string;
      courseId?: string;
      instructorId?: string;
      reviewedOrganizationId?: string;
      rating?: { $gte?: number; $lte?: number };
    } = { isActive: true };

    // Apply filters
    if (filters.reviewType) {
      query.reviewType = filters.reviewType;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.courseId) {
      query.courseId = filters.courseId;
    }

    if (filters.instructorId) {
      query.instructorId = filters.instructorId;
    }

    if (filters.reviewedOrganizationId) {
      query.reviewedOrganizationId = filters.reviewedOrganizationId;
    }

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
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid review ID');
    }

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
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid review ID');
    }

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

  private buildReviewFilter(dto: CreateReviewDto): {
    userId: string;
    reviewType: ReviewType;
    isActive: boolean;
    courseId?: string;
    instructorId?: string;
    reviewedOrganizationId?: string;
  } {
    const filter: {
      userId: string;
      reviewType: ReviewType;
      isActive: boolean;
      courseId?: string;
      instructorId?: string;
      reviewedOrganizationId?: string;
    } = {
      userId: dto.userId,
      reviewType: dto.reviewType,
      isActive: true,
    };

    if (dto.reviewType === ReviewType.COURSE && dto.courseId) {
      filter.courseId = dto.courseId;
    } else if (dto.reviewType === ReviewType.INSTRUCTOR && dto.instructorId) {
      filter.instructorId = dto.instructorId;
    } else if (dto.reviewType === ReviewType.ORGANIZATION && dto.reviewedOrganizationId) {
      filter.reviewedOrganizationId = dto.reviewedOrganizationId;
    }

    return filter;
  }
}
