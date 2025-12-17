import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';
import { ReviewType } from '../enum/reviewType.enum';
import { Types } from 'mongoose';

export class CreateReviewDto {
    @IsMongoId()
    @IsNotEmpty()
    userId: string;

    @IsEnum(ReviewType)
    @IsNotEmpty()
    reviewType: ReviewType;

    @IsNumber()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    rating: number;

    @IsString()
    @IsOptional()
    comment?: string;

    // Course Review fields
    @ValidateIf((o) => o.reviewType === ReviewType.COURSE)
    @IsMongoId()
    @IsNotEmpty()
    courseId?: string;

    @ValidateIf((o) => o.reviewType === ReviewType.COURSE)
    @IsMongoId()
    @IsOptional()
    enrollmentId?: string;

    @ValidateIf((o) => o.reviewType === ReviewType.COURSE)
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    contentQuality?: number;

    @ValidateIf((o) => o.reviewType === ReviewType.COURSE)
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    instructorQuality?: number;

    @ValidateIf((o) => o.reviewType === ReviewType.COURSE)
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    valueForMoney?: number;

    // Instructor Review fields
    @ValidateIf((o) => o.reviewType === ReviewType.INSTRUCTOR)
    @IsMongoId()
    @IsNotEmpty()
    instructorId?: string;

    @ValidateIf((o) => o.reviewType === ReviewType.INSTRUCTOR)
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    teachingQuality?: number;

    @ValidateIf((o) => o.reviewType === ReviewType.INSTRUCTOR)
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    communication?: number;

    @ValidateIf((o) => o.reviewType === ReviewType.INSTRUCTOR)
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    responsiveness?: number;

    @ValidateIf((o) => o.reviewType === ReviewType.INSTRUCTOR)
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    knowledgeLevel?: number;

    // Organization Review fields
    @ValidateIf((o) => o.reviewType === ReviewType.ORGANIZATION)
    @IsMongoId()
    @IsNotEmpty()
    reviewedOrganizationId?: string;

    @ValidateIf((o) => o.reviewType === ReviewType.ORGANIZATION)
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    coursesQuality?: number;

    @ValidateIf((o) => o.reviewType === ReviewType.ORGANIZATION)
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    platformExperience?: number;

    @ValidateIf((o) => o.reviewType === ReviewType.ORGANIZATION)
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsOptional()
    support?: number;
}
