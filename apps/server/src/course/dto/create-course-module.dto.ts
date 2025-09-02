import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsMongoId,
    IsArray,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseModuleDto {
    @IsMongoId()
    @IsNotEmpty()
    courseId: string;

    @IsMongoId()
    @IsNotEmpty()
    organizationId: string;

    @IsString()
    @IsNotEmpty()
    createdBy: string;

    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    contentsIds?: string[];

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;
}
