import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDto } from './dto/get-reviews.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard } from 'src/role/guards/permissions.guard';
import { RequiredPermissions } from 'src/role/permission.decorator';
import { Actions } from 'src/role/enum/Action.enum';
import { Subjects } from 'src/role/enum/subject.enum';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';

@Controller('review')
export class ReviewControllerHttp {
    constructor(private readonly reviewService: ReviewService) { }

    @UseGuards(AuthGuard)
    @Post()
    async create(
        @Body() createReviewDto: CreateReviewDto,
        @Request() req: IUserRequest,
    ) {
        createReviewDto.userId = req.user._id.toString();

        return await this.reviewService.create(createReviewDto);
    }

    @Get()
    async findAll(@Query() getReviewsDto: GetReviewsDto) {
        return await this.reviewService.findAll(getReviewsDto);
    }

    @Get('average')
    async getAverageRating(@Query() filter: GetReviewsDto) {
        return await this.reviewService.getAverageRating(filter);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.reviewService.findOne(id);
    }

    @UseGuards(AuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateReviewDto: UpdateReviewDto,
        @Request() req: IUserRequest,
    ) {
        // Optional: Add authorization check to ensure user can only update their own reviews
        const review = await this.reviewService.findOne(id);
        if (review.userId.toString() !== req.user._id.toString()) {
            throw new Error('You can only update your own reviews');
        }

        return await this.reviewService.update(id, updateReviewDto);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req: IUserRequest) {
        // Optional: Add authorization check
        const review = await this.reviewService.findOne(id);
        if (review.userId.toString() !== req.user._id.toString()) {
            throw new Error('You can only delete your own reviews');
        }

        return await this.reviewService.remove(id);
    }
}

