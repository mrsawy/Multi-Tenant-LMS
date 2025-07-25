
import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsMongoId,
    ValidateNested,
    IsOptional,
    IsDateString,
    IsNumber,
    IsUrl,
    Min,
    Max,
    ArrayNotEmpty,
    IsEnum
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Types } from 'mongoose';
import { CourseType } from '../enum/courseType.enum';

// Base content item DTO
export class BaseContentItemDto {
    @IsNotEmpty()
    @IsEnum(CourseType)
    type: CourseType
}

// Video content DTO
export class VideoContentDto extends BaseContentItemDto {
    override type = CourseType.VIDEO;

    @IsNotEmpty()
    @IsUrl({}, { message: 'Video URL must be a valid URL' })
    url: string;
}

// Article content DTO
export class ArticleContentDto extends BaseContentItemDto {
    override type = CourseType.ARTICLE;

    @IsNotEmpty()
    @IsString()
    body: string;
}

// Assignment content DTO
export class AssignmentContentDto extends BaseContentItemDto {
    override type = CourseType.ASSIGNMENT;

    @IsNotEmpty()
    @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
    dueDate: string;

    @IsOptional()
    @IsNumber()
    @Min(1, { message: 'Max points must be at least 1' })
    @Max(1000, { message: 'Max points cannot exceed 1000' })
    maxPoints?: number = 100;

    @IsNotEmpty()
    @IsUrl({}, { message: 'File URL must be a valid URL' })
    fileUrl: string;
}

// // Union type for all content items
export type ContentItemDto = VideoContentDto | ArticleContentDto | AssignmentContentDto;

export class CreateCourseContentDto {
    @IsNotEmpty()
    @IsMongoId({ message: 'Course ID must be a valid MongoDB ObjectId' })
    @Transform(({ value }) => value.toString())
    courseId: string;

    @IsOptional()
    organizationId: string;

    @IsOptional()
    createdBy: string;

    @IsNotEmpty()
    @IsString()
    title: string

    @IsOptional()
    @IsString()
    description: string

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => Object, {
        discriminator: {
            property: 'type',
            subTypes: [
                { value: VideoContentDto, name: CourseType.VIDEO },
                { value: ArticleContentDto, name: CourseType.ARTICLE },
                { value: AssignmentContentDto, name: CourseType.ASSIGNMENT },
            ],
        },
    })
    data: ContentItemDto;
}
