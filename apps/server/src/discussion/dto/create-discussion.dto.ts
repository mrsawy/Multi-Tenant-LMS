import { IsString, IsNotEmpty, IsEnum, IsOptional, IsMongoId, ValidateIf } from 'class-validator';
import DiscussionType from '../enum/discussion-type.enum';

export class CreateDiscussionDto {
  @IsEnum(DiscussionType)
  @IsNotEmpty()
  type: DiscussionType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsMongoId()
  @IsOptional()
  parentId?: string;

  // Course Discussion
  @ValidateIf((o) => o.type === DiscussionType.COURSE)
  @IsMongoId()
  @IsNotEmpty()
  courseId?: string;

  // Module Discussion
  @ValidateIf((o) => o.type === DiscussionType.MODULE)
  @IsMongoId()
  @IsNotEmpty()
  moduleId?: string;

  // Content Discussion
  @ValidateIf((o) => o.type === DiscussionType.CONTENT)
  @IsMongoId()
  @IsNotEmpty()
  contentId?: string;
}

