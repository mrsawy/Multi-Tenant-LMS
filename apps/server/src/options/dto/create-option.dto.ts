import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateOptionDto {

    @IsString()
    @IsNotEmpty()
    key: string;

    @IsNotEmpty()
    @IsString()
    value: any;

    @IsString()
    @IsOptional()
    organizationId?: string; // for multi-tenant support
}
