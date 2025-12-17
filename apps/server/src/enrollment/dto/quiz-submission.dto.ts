import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  Min,
  Max,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
class SubmittedAnswerDto {
  @IsNumber()
  @Min(0)
  questionIndex: number;

  @IsNumber()
  @Min(0)
  selectedOption: number;
}

export class SubmitQuizDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  quizId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmittedAnswerDto)
  answers: SubmittedAnswerDto[];

  @IsNumber()
  @Min(0)
  timeTakenInSeconds?: number;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsNotEmpty()
  @IsMongoId()
  enrollmentId: string;
}

export class GetQuizAttemptsDto {
  @IsString()
  @IsNotEmpty()
  quizId: string;

  @IsString()
  @IsOptional()
  studentId?: string; // For admin/instructor to check specific student
}
