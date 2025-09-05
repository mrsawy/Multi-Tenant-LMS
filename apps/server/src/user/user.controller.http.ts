import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Request, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RequiredPermissions } from 'src/role/permission.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Actions } from 'src/role/enum/Action.enum';
import { Subjects } from 'src/role/enum/subject.enum';
import { PermissionsGuard } from 'src/role/guards/permissions.guard';
import { RoleService } from 'src/role/role.service';
import { handleError } from 'src/utils/errorHandling';
import { AppAbility } from 'src/role/permissions.factory';
import { checkConditionForRule } from 'src/utils/abilityUtils';
import { Conditions } from 'src/role/enum/Conditions.enum';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';


@Controller('user')
export class UserControllerHttp {
  constructor(private readonly userService: UserService,
    private readonly roleService: RoleService
  ) { }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.CREATE, subject: Subjects.USER })
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    try {
      const organizationId = req.user.organization._id
      const role = createUserDto.role;
      await this.roleService.findOne(role);
      const createdUserDoc = await this.userService.create({ ...createUserDto, organizationId });
      const { password, ...createdUser } = createdUserDoc;

      return {
        message: 'User created successfully',
        user: createdUser,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      handleError(error);
    }
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.READ, subject: Subjects.USER })
  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  @Get("user-data")
  @UseGuards(AuthGuard)
  async findOwnData(@Request() req: IUserRequest) {
    const user = req.user;
    const foundedUser = await this.userService.findOne(user._id as string);
    if (!foundedUser) throw new UnauthorizedException('User not found')
    const { password, ...userData } = foundedUser;
    return {
      message: 'User data fetched successfully',
      user: userData,
    };
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.USER })
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    const userAbility = req.userAbility as AppAbility

    const { hasCondition, conditionValue } = checkConditionForRule(userAbility, Actions.UPDATE, Subjects.USER, Conditions.SELF);

    if (hasCondition) {
      if (id !== conditionValue) {
        throw new UnauthorizedException('You can only update your own user information');
      }
    }

    if (updateUserDto.role) {
      if (userAbility.cannot(Actions.UPDATE, Subjects.ROLE)) {
        throw new UnauthorizedException('You do not have permission to update roles');
      }
    }

    return this.userService.update(id, updateUserDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }


}
