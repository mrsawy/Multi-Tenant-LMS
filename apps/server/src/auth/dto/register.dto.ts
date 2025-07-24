import { IsNotEmpty, IsString } from "class-validator";
import { CreateOrganizationDto } from "src/organization/dto/create-organization.dto";
import { CreateUserDto } from "src/user/dto/create-user.dto";


export class RegisterDto {
    userDto: CreateUserDto
    organizationDto: CreateOrganizationDto
}


