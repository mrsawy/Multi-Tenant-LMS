import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Request, InternalServerErrorException, UnauthorizedException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { UserService } from   '../../services/user.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { User } from '../../entities/user.entity';
import mongoose, { Connection, Model, PaginateOptions } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { RequiredPermissions } from 'src/role/permission.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Actions } from 'src/role/enum/Action.enum';
import { Subjects } from 'src/role/enum/subject.enum';
import { PermissionsGuard } from 'src/role/guards/permissions.guard';
import { RoleService } from 'src/role/role.service';
import { handleError, handleRpcError } from 'src/utils/errorHandling';
import { AppAbility } from 'src/role/permissions.factory';
import { checkConditionForRule } from 'src/utils/abilityUtils';
import { Conditions } from 'src/role/enum/Conditions.enum';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';
import { Ctx, MessagePattern, Payload } from '@nestjs/microservices';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import { WalletService } from 'src/wallet/wallet.service';
import { convertObjectValuesToObjectId } from 'src/utils/ObjectId.utils';

@Controller('user')
export class UserControllerMessage {
  constructor(
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    @Inject(forwardRef(() => WalletService)) private readonly walletService: WalletService,
    @InjectConnection() private readonly connection: Connection
  ) { }

  @MessagePattern('user.getOwnData')
  @UseGuards(AuthGuard)
  async findOwnData(@Request() req: IUserRequest) {
    const user = req.user;
    const foundedUser = await this.userService.findOne(user._id.toString());
    if (!foundedUser) throw new UnauthorizedException('User not found');
    const { password, ...userData } = foundedUser;
    return {
      message: 'User data fetched successfully',
      user: userData,
    };
  }

  @MessagePattern('users.getByOrganization')
  @UseGuards(AuthGuard)
  async getByOrganization(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe())
    payload: {
      options: PaginateOptions;
      filters?: mongoose.RootFilterQuery<User>;
    }
  ) {
    return await this.userService.getByOrganization(context.userPayload.organizationId, payload.options, payload.filters);
  }

  @MessagePattern('users.getSingleUserByOrganization')
  @UseGuards(AuthGuard)
  async getSingleUserByOrganization(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe())
    payload: { filters: mongoose.RootFilterQuery<User> }
  ) {
    console.dir({ payload, convertObjectValuesToObjectId: convertObjectValuesToObjectId(payload.filters) }, { depth: null });

    const user = await this.userService.filterOne({
      ...convertObjectValuesToObjectId(payload.filters),
      autherization: undefined,
      organizationId: new mongoose.Types.ObjectId(context.userPayload.organizationId),
    });
    if (!user) throw new BadRequestException('User not found');
    const { password, ...userData } = user.toObject();
    console.dir({ userData }, { depth: null });
    return userData;
  }

  @MessagePattern('users.organizationCreateUser')
  @UseGuards(AuthGuard)
  async organizationCreateUser(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe())
    payload: CreateUserDto
  ) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const userId = new mongoose.Types.ObjectId();
      const walletId = new mongoose.Types.ObjectId();
      const createdUser = await this.userService.create(
        {
          ...payload,
          _id: userId,
          organizationId: new mongoose.Types.ObjectId(context.userPayload.organizationId),
          walletId,
        },
        session
      );
      await this.walletService.create({ _id: walletId, userId: userId, currency: payload.preferredCurrency }, session);

      await session.commitTransaction();
      return createdUser;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      handleRpcError(error);
    }
  }

  @MessagePattern('users.organizationUpdateUser')
  @UseGuards(AuthGuard)
  async organizationUpdateUser(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe())
    payload: { userId: string; userData: Partial<CreateUserDto> }
  ) {
    return await this.userService.update(
      {
        _id: new mongoose.Types.ObjectId(payload.userId),
        organizationId: new mongoose.Types.ObjectId(context.userPayload.organizationId),
      },
      payload.userData
    );
  }

  @MessagePattern('users.organizationDeleteUser')
  @UseGuards(AuthGuard)
  async organizationDeleteUser(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe())
    payload: { userId: string }
  ) {
    const result = await this.userService.delete({
      _id: new mongoose.Types.ObjectId(payload.userId),
      organizationId: new mongoose.Types.ObjectId(context.userPayload.organizationId),
    });

    if (result.deletedCount == 0) throw new BadRequestException('User not found');

    return result;
  }
}
