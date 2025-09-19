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
    ValidateIf,
    IsArray,
    ValidateNested
} from 'class-validator';
import { ContentType } from '../enum/contentType.enum';
import { VideoType } from '../enum/videoType.enum';
import { Type } from 'class-transformer';

export class CreateCourseContentDto {
    @IsNotEmpty()
    @IsMongoId({ message: 'Course ID must be a valid MongoDB ObjectId' })
    courseId: string;

    @IsNotEmpty()
    @IsMongoId({ message: 'Module ID must be a valid MongoDB ObjectId' })
    moduleId: string;

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
    @IsEnum(ContentType)
    type: ContentType;

    @ValidateIf(o => o.type === ContentType.VIDEO)
    @IsNotEmpty()
    @IsEnum(VideoType)
    videoType?: string;


    @ValidateIf(o => (o.type === ContentType.VIDEO && o.videoType === VideoType.URL))
    @IsNotEmpty()
    @IsString()
    videoUrl?: string;

    @ValidateIf(o => (o.type === ContentType.VIDEO && o.videoType === VideoType.UPLOAD) || o.type === ContentType.ASSIGNMENT)
    @IsNotEmpty()
    @IsString()
    fileKey?: string;

    // Article-specific properties (only validated when type is ARTICLE)
    @ValidateIf(o => o.type === ContentType.ARTICLE)
    @IsNotEmpty({ message: 'Body is required for article content' })
    @IsString()
    body?: string;

    @ValidateIf(o => o.type === ContentType.ARTICLE)
    @IsOptional()
    @IsString()
    summary?: string;

    // Assignment-specific properties (only validated when type is ASSIGNMENT)
    @ValidateIf(o => o.type === ContentType.ASSIGNMENT)
    @IsNotEmpty({ message: 'Due date is required for assignment content' })
    @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
    dueDate?: Date;

    @ValidateIf(o => o.type === ContentType.ASSIGNMENT)
    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'Max points must be at least 1' })
    @Max(1000, { message: 'Max points cannot exceed 1000' })
    maxPoints?: number = 100;

    @ValidateIf(o => o.type === ContentType.ASSIGNMENT)
    @IsOptional()
    @IsString()
    instructions?: string;


    @IsOptional()
    @IsString()
    authorization?: string


    @ValidateIf(o => o.type === ContentType.QUIZ)
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Question)
    @IsNotEmpty()
    questions?: Question[]


    @ValidateIf(o => o.type === ContentType.QUIZ)
    @IsDateString()
    @IsNotEmpty()
    quizStartDate?: string


    @ValidateIf(o => o.type === ContentType.QUIZ)
    @IsDateString()
    @IsNotEmpty()
    quizEndDate?: string


    @ValidateIf(o => o.type === ContentType.QUIZ)
    @IsNumber()
    @IsNotEmpty()
    quizDurationInMinutes?: number
}



class Question {
    @IsNotEmpty()
    @IsArray()
    options: string[]

    @IsNotEmpty()
    @IsNumber()
    correctOption: number

    @IsNotEmpty()
    @IsString()
    questionText: string
}