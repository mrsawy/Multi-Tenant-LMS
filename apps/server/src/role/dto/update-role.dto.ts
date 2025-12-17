import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Actions } from '../enum/Action.enum';
import { Subjects } from '../enum/subject.enum';
import { Conditions } from '../enum/Conditions.enum';
import { Type } from 'class-transformer';

export class PermissionDto {
  @IsNotEmpty()
  @IsEnum(Actions)
  action: Actions;

  @IsNotEmpty()
  @IsEnum(Subjects)
  subject: Subjects;

  @IsOptional()
  @IsArray()
  @IsEnum(Conditions, { each: true })
  conditions?: Conditions[];
}
export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions?: PermissionDto[];

  @IsOptional()
  @IsString()
  name?: string;
}
