// src/file/dto/file.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { FileCategory } from '../enum/fileCategory.enum';



export class GeneratePresignedUrlDto {
    @IsString()
    @IsNotEmpty()
    fileType: string;

    @IsNumber()
    fileSize: number;

    // @IsEnum(FileCategory)
    // category: FileCategory;

    @IsString()
    @IsOptional()
    userUserName?: string;

    @IsNotEmpty()
    @IsString()
    fileKey: string

    @IsOptional()
    @IsString()
    authorization?: string
}

export class PresignedUrlResponseDto {
    uploadUrl: string;
    fileKey: string;
    expiresAt: Date;
}

export class ValidateFileKeysDto {
    @IsString({ each: true })
    fileKeys: string[];
}

export class FileMetadataDto {
    fileKey: string;
    originalName: string;
    size: number;
    type: string;
    uploadedAt: Date;
}