import {
    IsNotEmpty,
    IsString,
    IsMongoId,
    IsOptional,
    IsDateString,
    IsNumber,
    Min,
    Max,
    IsEnum,
    ValidateIf
} from 'class-validator';
import { CourseType } from '../enum/courseType.enum';

export class CreateCourseContentDto {
    @IsNotEmpty()
    @IsMongoId({ message: 'Course ID must be a valid MongoDB ObjectId' })
    courseId: string;

    @IsOptional()
    organizationId: string;

    @IsOptional()
    createdBy: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsEnum(CourseType)
    type: CourseType;

    @ValidateIf(o => o.type === CourseType.VIDEO)
    @IsNotEmpty()
    @IsString()
    fileKey?: string;

    // Article-specific properties (only validated when type is ARTICLE)
    @ValidateIf(o => o.type === CourseType.ARTICLE)
    @IsNotEmpty({ message: 'Body is required for article content' })
    @IsString()
    body?: string;

    @ValidateIf(o => o.type === CourseType.ARTICLE)
    @IsOptional()
    @IsString()
    summary?: string;

    // Assignment-specific properties (only validated when type is ASSIGNMENT)
    @ValidateIf(o => o.type === CourseType.ASSIGNMENT)
    @IsNotEmpty({ message: 'Due date is required for assignment content' })
    @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
    dueDate?: Date;

    @ValidateIf(o => o.type === CourseType.ASSIGNMENT)
    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'Max points must be at least 1' })
    @Max(1000, { message: 'Max points cannot exceed 1000' })
    maxPoints?: number = 100;

    @ValidateIf(o => o.type === CourseType.ASSIGNMENT)
    @IsOptional()
    @IsString()
    instructions?: string;


    // @IsOptional()
    // file: any
}
