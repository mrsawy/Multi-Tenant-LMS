import { Controller, UseGuards } from '@nestjs/common';
import {
    MessagePattern,
    Payload,
    Ctx,
} from '@nestjs/microservices';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import { RpcErrorHandler } from 'src/utils/docerators/error-handeling/method/RpcErrController.decorator';

@Controller()
export class ReviewControllerMessage {
    constructor(private readonly reviewService: ReviewService) { }

    @UseGuards(AuthGuard)
    @MessagePattern('reviews.create')
    @RpcErrorHandler
    async create(
        @Payload(new RpcValidationPipe()) createReviewDto: CreateReviewDto,
        @Ctx() context: IUserContext,
    ) {
        return await this.reviewService.create({ ...createReviewDto, userId: context.userPayload._id.toString() });
    }

    @UseGuards(AuthGuard)
    @MessagePattern('reviews.findOwn')
    @RpcErrorHandler
    async findOwn(
        @Payload(new RpcValidationPipe()) filters: { reviewType: any; courseId?: string; moduleId?: string; contentId?: string; instructorId?: string; reviewedOrganizationId?: string },
        @Ctx() context: IUserContext,
    ) {
        return await this.reviewService.findOwn(context.userPayload._id.toString(), filters);
    }

    @MessagePattern('reviews.findAll')
    async findAll(
        @Payload(new RpcValidationPipe()) getReviewsDto: GetReviewsDto,
    ) {
        return await this.reviewService.findAll(getReviewsDto);
    }

    @MessagePattern('reviews.findOne')
    async findOne(@Payload() payload: { id: string }) {
        return await this.reviewService.findOne(payload.id);
    }

    @MessagePattern('reviews.getAverageRating')
    async getAverageRating(@Payload() filter: GetReviewsDto) {
        return await this.reviewService.getAverageRating(filter);
    }

    @UseGuards(AuthGuard)
    @MessagePattern('reviews.update')
    async update(
        @Payload(new RpcValidationPipe())
        payload: { id: string; updateReviewDto: UpdateReviewDto },
        @Ctx() context: IUserContext,
    ) {
        // Optional: Add authorization check
        const review = await this.reviewService.findOne(payload.id);
        if (review.userId.toString() !== context.userPayload._id.toString()) {
            throw new Error('You can only update your own reviews');
        }

        return await this.reviewService.update(
            payload.id,
            payload.updateReviewDto,
        );
    }

    @UseGuards(AuthGuard)
    @MessagePattern('reviews.remove')
    async remove(
        @Payload() payload: { id: string },
        @Ctx() context: IUserContext,
    ) {
        // Optional: Add authorization check
        const review = await this.reviewService.findOne(payload.id);
        if (review.userId.toString() !== context.userPayload._id.toString()) {
            throw new Error('You can only delete your own reviews');
        }

        return await this.reviewService.remove(payload.id);
    }

    @MessagePattern('reviews.findByCourse')
    async findByCourse(@Payload() payload: { courseId: string; page?: number; limit?: number }) {
        return await this.reviewService.findAll({
            courseId: payload.courseId,
            page: payload.page || 1,
            limit: payload.limit || 10,
        });
    }

    @MessagePattern('reviews.findByInstructor')
    async findByInstructor(@Payload() payload: { instructorId: string; page?: number; limit?: number }) {
        return await this.reviewService.findAll({
            instructorId: payload.instructorId,
            page: payload.page || 1,
            limit: payload.limit || 10,
        });
    }

    @MessagePattern('reviews.findByOrganization')
    async findByOrganization(@Payload() payload: { reviewedOrganizationId: string; page?: number; limit?: number }) {
        return await this.reviewService.findAll({
            reviewedOrganizationId: payload.reviewedOrganizationId,
            page: payload.page || 1,
            limit: payload.limit || 10,
        });
    }

    @MessagePattern('reviews.getCourseAverageRating')
    async getCourseAverageRating(@Payload() payload: { courseId: string }) {
        return await this.reviewService.getAverageRating({
            courseId: payload.courseId,
        });
    }

    @MessagePattern('reviews.getInstructorAverageRating')
    async getInstructorAverageRating(@Payload() payload: { instructorId: string }) {
        return await this.reviewService.getAverageRating({
            instructorId: payload.instructorId,
        });
    }

    @MessagePattern('reviews.getOrganizationAverageRating')
    async getOrganizationAverageRating(@Payload() payload: { reviewedOrganizationId: string }) {
        return await this.reviewService.getAverageRating({
            reviewedOrganizationId: payload.reviewedOrganizationId,
        });
    }
}

