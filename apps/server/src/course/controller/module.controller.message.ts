import {
  Controller,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from '../services/course.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import { handleRpcError } from 'src/utils/errorHandling';
import { CreateCourseModuleDto } from '../dto/create-course-module.dto';
import { CourseModulesService } from '../services/courseModules.service';
import { CourseContentService } from '../services/courseContent.service';
import { PaginateOptions } from 'mongoose';
import { ICourseFilters } from 'src/utils/types/CourseFilters';

@Controller()
export class ModuleControllerMessage {
  constructor(
    private readonly courseModulesService: CourseModulesService,
  ) {}

  @MessagePattern('course.createModule')
  @UseGuards(AuthGuard)
  async createModule(
    @Payload(new RpcValidationPipe())
    payload: CreateCourseModuleDto,
    @Ctx() context: IUserContext,
  ) {
    try {
      const user = context.userPayload;
      payload.organizationId = user.organizationId.toString();
      payload.createdBy = user._id.toString();
      const createdModule = await this.courseModulesService.create(payload);
      return createdModule;
    } catch (error) {
      handleRpcError(error);
    }
  }

  @MessagePattern('course.deleteModules')
  @UseGuards(AuthGuard)
  async deleteModules(
    @Payload(new RpcValidationPipe())
    payload: { moduleIds: string[] },
    @Ctx() context: IUserContext,
  ) {
    try {
      const user = context.userPayload;
      return await this.courseModulesService.deleteModules(payload.moduleIds);
    } catch (error) {
      handleRpcError(error);
    }
  }

  @MessagePattern('course.deleteModule')
  @UseGuards(AuthGuard)
  async deleteModule(
    @Payload(new RpcValidationPipe())
    payload: { moduleId: string },
    // @Ctx() context: IUserContext,
  ) {
    try {
      // const user = context.userPayload
      return await this.courseModulesService.deleteModule(payload.moduleId);
    } catch (error) {
      handleRpcError(error);
    }
  }
}
