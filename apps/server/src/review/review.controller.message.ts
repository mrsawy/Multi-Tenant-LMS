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
import { handleRpcError } from 'src/utils/errorHandling';

@Controller()
export class ReviewControllerMessage {
    constructor(private readonly reviewService: ReviewService) { }

    @UseGuards(AuthGuard)
    @MessagePattern('reviews.create')
    async create(
        @Payload(new RpcValidationPipe()) createReviewDto: CreateReviewDto,
        @Ctx() context: IUserContext,
    ) {
        try {
            createReviewDto.userId = context.userPayload._id.toString();

            return await this.reviewService.create(createReviewDto);
        } catch (error) {
            handleRpcError(error);
        }
    }

    @MessagePattern('reviews.findAll')
    async findAll(
        @Payload(new RpcValidationPipe()) getReviewsDto: GetReviewsDto,
    ) {
        try {
            return await this.reviewService.findAll(getReviewsDto);
        } catch (error) {
            handleRpcError(error);
        }
    }

    @MessagePattern('reviews.findOne')
    async findOne(@Payload() payload: { id: string }) {
        try {
            return await this.reviewService.findOne(payload.id);
        } catch (error) {
            handleRpcError(error);
        }
    }

    @MessagePattern('reviews.getAverageRating')
    async getAverageRating(@Payload() filter: GetReviewsDto) {
        try {
            return await this.reviewService.getAverageRating(filter);
        } catch (error) {
            handleRpcError(error);
        }
    }

    @UseGuards(AuthGuard)
    @MessagePattern('reviews.update')
    async update(
        @Payload(new RpcValidationPipe())
        payload: { id: string; updateReviewDto: UpdateReviewDto },
        @Ctx() context: IUserContext,
    ) {
        try {
            // Optional: Add authorization check
            const review = await this.reviewService.findOne(payload.id);
            if (review.userId.toString() !== context.userPayload._id.toString()) {
                throw new Error('You can only update your own reviews');
            }

            return await this.reviewService.update(
                payload.id,
                payload.updateReviewDto,
            );
        } catch (error) {
            handleRpcError(error);
        }
    }

    @UseGuards(AuthGuard)
    @MessagePattern('reviews.remove')
    async remove(
        @Payload() payload: { id: string },
        @Ctx() context: IUserContext,
    ) {
        try {
            // Optional: Add authorization check
            const review = await this.reviewService.findOne(payload.id);
            if (review.userId.toString() !== context.userPayload._id.toString()) {
                throw new Error('You can only delete your own reviews');
            }

            return await this.reviewService.remove(payload.id);
        } catch (error) {
            handleRpcError(error);
        }
    }

    @MessagePattern('reviews.findByCourse')
    async findByCourse(@Payload() payload: { courseId: string; page?: number; limit?: number }) {
        try {
            return await this.reviewService.findAll({
                courseId: payload.courseId,
                page: payload.page || 1,
                limit: payload.limit || 10,
            });
        } catch (error) {
            handleRpcError(error);
        }
    }

    @MessagePattern('reviews.findByInstructor')
    async findByInstructor(@Payload() payload: { instructorId: string; page?: number; limit?: number }) {
        try {
            return await this.reviewService.findAll({
                instructorId: payload.instructorId,
                page: payload.page || 1,
                limit: payload.limit || 10,
            });
        } catch (error) {
            handleRpcError(error);
        }
    }

    @MessagePattern('reviews.findByOrganization')
    async findByOrganization(@Payload() payload: { reviewedOrganizationId: string; page?: number; limit?: number }) {
        try {
            return await this.reviewService.findAll({
                reviewedOrganizationId: payload.reviewedOrganizationId,
                page: payload.page || 1,
                limit: payload.limit || 10,
            });
        } catch (error) {
            handleRpcError(error);
        }
    }

    @MessagePattern('reviews.getCourseAverageRating')
    async getCourseAverageRating(@Payload() payload: { courseId: string }) {
        try {
            return await this.reviewService.getAverageRating({
                courseId: payload.courseId,
            });
        } catch (error) {
            handleRpcError(error);
        }
    }

    @MessagePattern('reviews.getInstructorAverageRating')
    async getInstructorAverageRating(@Payload() payload: { instructorId: string }) {
        try {
            return await this.reviewService.getAverageRating({
                instructorId: payload.instructorId,
            });
        } catch (error) {
            handleRpcError(error);
        }
    }

    @MessagePattern('reviews.getOrganizationAverageRating')
    async getOrganizationAverageRating(@Payload() payload: { reviewedOrganizationId: string }) {
        try {
            return await this.reviewService.getAverageRating({
                reviewedOrganizationId: payload.reviewedOrganizationId,
            });
        } catch (error) {
            handleRpcError(error);
        }
    }
}

