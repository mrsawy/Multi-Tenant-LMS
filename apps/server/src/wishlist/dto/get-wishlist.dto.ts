import { IsMongoId, IsOptional, IsBoolean, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetWishlistDto {
    @IsMongoId()
    @IsOptional()
    courseId?: string;

    @IsBoolean()
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean;

    @IsNumber()
    @IsOptional()
    page?: string;

    @IsNumber()
    @IsOptional()
    limit?: string;
}
