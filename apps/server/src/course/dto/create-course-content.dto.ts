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
  ValidateNested,
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

  @ValidateIf((o) => o.type === ContentType.VIDEO)
  @IsNotEmpty()
  @IsEnum(VideoType)
  videoType?: string;

  @ValidateIf(
    (o) => o.type === ContentType.VIDEO && o.videoType === VideoType.URL,
  )
  @IsNotEmpty()
  @IsString()
  videoUrl?: string;

  @ValidateIf(
    (o) =>
      (o.type === ContentType.VIDEO && o.videoType === VideoType.UPLOAD) ||
      o.type === ContentType.ASSIGNMENT,
  )
  @IsNotEmpty()
  @IsString()
  fileKey?: string;

  // Article-specific properties (only validated when type is ARTICLE)
  @ValidateIf((o) => o.type === ContentType.ARTICLE)
  @IsNotEmpty({ message: 'Body is required for article content' })
  @IsString()
  body?: string;

  @ValidateIf((o) => o.type === ContentType.ARTICLE)
  @IsOptional()
  @IsString()
  summary?: string;

  // Assignment and Project shared properties
  @ValidateIf(
    (o) =>
      o.type === ContentType.ASSIGNMENT || o.type === ContentType.PROJECT,
  )
  @IsNotEmpty({ message: 'Due date is required' })
  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  dueDate?: Date;

  @ValidateIf(
    (o) =>
      o.type === ContentType.ASSIGNMENT || o.type === ContentType.PROJECT,
  )
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Max points must be at least 1' })
  @Max(1000, { message: 'Max points cannot exceed 1000' })
  maxPoints?: number = 100;

  @ValidateIf((o) => o.type === ContentType.ASSIGNMENT)
  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  authorization?: string;

  @ValidateIf((o) => o.type === ContentType.QUIZ)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Question)
  @IsNotEmpty()
  questions?: Question[];

  @ValidateIf((o) => o.type === ContentType.QUIZ)
  @IsDateString()
  @IsNotEmpty()
  quizStartDate?: string;

  @ValidateIf((o) => o.type === ContentType.QUIZ)
  @IsDateString()
  @IsNotEmpty()
  quizEndDate?: string;

  @ValidateIf((o) => o.type === ContentType.QUIZ)
  @IsNumber()
  @IsNotEmpty()
  quizDurationInMinutes?: number;

  // Project-specific properties (only validated when type is PROJECT)
  @ValidateIf((o) => o.type === ContentType.PROJECT)
  @IsNotEmpty({ message: 'Requirements are required for project content' })
  @IsString()
  requirements?: string;

  @ValidateIf((o) => o.type === ContentType.PROJECT)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[];

  @ValidateIf((o) => o.type === ContentType.PROJECT)
  @IsOptional()
  @IsString()
  isGroupProject?: boolean;

  @ValidateIf((o) => o.type === ContentType.PROJECT)
  @IsOptional()
  @IsNumber()
  @Min(2, { message: 'Max group size must be at least 2' })
  maxGroupSize?: number;

  // Live Session-specific properties (only validated when type is LIVE_SESSION)
  @ValidateIf((o) => o.type === ContentType.LIVE_SESSION)
  @IsNotEmpty({ message: 'Start date is required for live session content' })
  @IsDateString({}, { message: 'Start date must be a valid ISO date string' })
  startDate?: Date;

  @ValidateIf((o) => o.type === ContentType.LIVE_SESSION)
  @IsNotEmpty({ message: 'End date is required for live session content' })
  @IsDateString({}, { message: 'End date must be a valid ISO date string' })
  endDate?: Date;

  @ValidateIf((o) => o.type === ContentType.LIVE_SESSION)
  @IsNotEmpty({ message: 'Meeting URL is required for live session content' })
  @IsString()
  meetingUrl?: string;

  @ValidateIf((o) => o.type === ContentType.LIVE_SESSION)
  @IsOptional()
  @IsString()
  meetingId?: string;

  @ValidateIf((o) => o.type === ContentType.LIVE_SESSION)
  @IsOptional()
  @IsString()
  meetingPassword?: string;

  @ValidateIf((o) => o.type === ContentType.LIVE_SESSION)
  @IsOptional()
  @IsString()
  platform?: string;

  @ValidateIf((o) => o.type === ContentType.LIVE_SESSION)
  @IsOptional()
  @IsString()
  recordingUrl?: string;

  @ValidateIf((o) => o.type === ContentType.LIVE_SESSION)
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Duration must be non-negative' })
  durationInMinutes?: number;
}

class Question {
  @IsNotEmpty()
  @IsArray()
  options: string[];

  @IsNotEmpty()
  @IsNumber()
  correctOption: number;

  @IsNotEmpty()
  @IsString()
  questionText: string;
}
