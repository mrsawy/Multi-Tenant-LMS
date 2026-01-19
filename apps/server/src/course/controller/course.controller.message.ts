import {
  Controller,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from '../services/course.service';
import { CourseFeaturedService } from '../services/course.featured.service';
import {
  Ctx,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import { handleRpcError } from 'src/utils/errorHandling';
import { CreateCourseModuleDto } from '../dto/create-course-module.dto';
import { CourseModulesService } from '../services/courseModules.service';
import { CreateCourseContentDto } from '../dto/create-course-content.dto';
import { CourseContentService } from '../services/courseContent.service';
import { PaginateOptions, Types } from 'mongoose';
import { ICourseFilters } from 'src/utils/types/CourseFilters';
import { ApplyRpcErrorHandling } from 'src/utils/docerators/error-handeling/class/ApplyRpcErrorHandling.decorator';

@ApplyRpcErrorHandling
@Controller()
export class CourseControllerMessage {
  constructor(
    private courseService: CourseService,
    private courseFeaturedService: CourseFeaturedService,
  ) { }

  @MessagePattern('courses.findAllCourses')
  async findAllCourses(
    @Payload(new RpcValidationPipe())
    payload: {
      options: ICourseFilters & { instructorId?: string; $or?: any[] };
    },
  ) {
    const query: Record<string, any> = {};

    // Handle direct instructorId
    if (payload.options.instructorId) {
      query.instructorId = new Types.ObjectId(payload.options.instructorId);
    }

    // Handle $or filter (for instructorId or coInstructorsIds)
    if (payload.options.$or && Array.isArray(payload.options.$or)) {
      // Convert string IDs to ObjectIds in $or conditions
      const processedOr = payload.options.$or.map((condition: any) => {
        const processedCondition: any = {};
        // Handle instructorId condition: { instructorId: string }
        if (condition.instructorId !== undefined) {
          processedCondition.instructorId = new Types.ObjectId(condition.instructorId);
        }
        // Handle coInstructorsIds condition: { coInstructorsIds: string }
        // MongoDB will check if the array contains this ObjectId
        if (condition.coInstructorsIds !== undefined) {
          processedCondition.coInstructorsIds = new Types.ObjectId(condition.coInstructorsIds);
        }
        return processedCondition;
      });
      query.$or = processedOr;
    }

    // Remove query operators and instructorId from filters
    const { instructorId, $or, ...filters } = payload.options;
    const courses = await this.courseService.findAll(query, filters);
    return courses;
  }

  @UseGuards(AuthGuard)
  @MessagePattern('courses.getAllCourses')
  async getAllCourses(
    @Ctx() context: IUserContext,
    @Payload(new RpcValidationPipe())
    payload: { options: PaginateOptions },
  ) {
    const user = context.userPayload;
    const courses = await this.courseService.findAll(
      { organizationId: user.organizationId },
      payload.options,
    );
    return courses;

  }

  @MessagePattern('courses.getCourseWithModule')
  async getCourseWithModule(
    @Payload(new RpcValidationPipe())
    payload: {
      courseId: string;
      includeContents?: boolean;
      contentSelect?: string;
    },
  ) {
    return await this.courseService.getCourseWithOrderedModules(
      payload.courseId,
      payload.includeContents,
      payload.contentSelect,
    );

  }

  @UseGuards(AuthGuard)
  @MessagePattern('courses.getCourse')
  async getCourse(
    @Payload(new RpcValidationPipe())
    payload: {
      courseId: string;
      data?: { authorization?: string };
    },
  ) {
    return await this.courseService.findOneById(payload.courseId);

  }

  @UseGuards(AuthGuard)
  @MessagePattern('course.updateCourse')
  async updateCourse(
    @Payload(new RpcValidationPipe())
    payload: UpdateCourseDto,
    @Ctx() context: IUserContext,
  ) {
    const result = await this.courseService.update(payload);
    return {
      success: true,
      data: result,
      message: 'Course updated successfully',
    };

  }

  @MessagePattern('course.createCourse')
  @UseGuards(AuthGuard)
  async createCourse(
    @Payload(new RpcValidationPipe())
    payload: CreateCourseDto,
    @Ctx() context: IUserContext,
  ) {
    const user = context.userPayload;
    return await this.courseService.create({
      organizationId: user.organizationId.toString(),
      createdBy: user._id.toString(),
      ...payload,
    });

  }

  @MessagePattern('courses.getFeatured')
  async getFeatured(
    @Payload(new RpcValidationPipe())
    payload: {
      limit: number;
    }
  ) {
    return await this.courseFeaturedService.getFeatured(payload.limit);
  }
}
