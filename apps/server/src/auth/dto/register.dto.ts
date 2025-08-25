import { Type } from "class-transformer";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { CreateOrganizationDto } from "src/organization/dto/create-organization.dto";
import { CreateUserDto } from "src/user/dto/create-user.dto";


export class RegisterDto {

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CreateUserDto)
    userDto: CreateUserDto

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => CreateOrganizationDto)
    organizationDto: CreateOrganizationDto
}


