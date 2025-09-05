

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
import { MessagePattern } from '@nestjs/microservices';


@Controller('user')
export class UserControllerMessage {
    constructor(private readonly userService: UserService,
        private readonly roleService: RoleService
    ) { }


    @MessagePattern("user.getOwnData")
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


}

