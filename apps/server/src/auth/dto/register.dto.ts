import { Type } from "class-transformer";
import { IsNotEmpty, ValidateNested, ValidateIf, IsOptional } from "class-validator";
import { CreateOrganizationDto } from "src/organization/dto/create-organization.dto";
import { CreateUserDto } from "src/user/dto/create-user.dto";

export class RegisterDto {

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CreateUserDto)
    userDto: CreateUserDto

    // @IsOptional()
    @ValidateIf(o => o.userDto.roleName !== "STUDENT")
    @ValidateNested()
    @IsNotEmpty()
    @Type(() => CreateOrganizationDto)
    organizationDto?: CreateOrganizationDto
}


