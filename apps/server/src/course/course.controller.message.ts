import { Controller, NotFoundException, BadRequestException, InternalServerErrorException, UseGuards } from "@nestjs/common";
import { CourseService } from "./course.service";
import { Ctx, MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { IUserContext } from "src/utils/types/IUserContext.interface";
import { handleRpcError } from "src/utils/errorHandling";
import { CreateCourseModuleDto } from "./dto/create-course-module.dto";
import { CourseModulesService } from "./courseModules.service";
import { CreateCourseContentDto } from "./dto/create-course-content.dto";
import { CourseContentService } from "./courseContent.service";


@Controller()
export class CourseControllerMessage {
    constructor(
        private courseService: CourseService,
        private readonly courseModulesService: CourseModulesService,
        private readonly courseContentService: CourseContentService
    ) { }

    @UseGuards(AuthGuard)
    @MessagePattern('courses.getAllCourses')
    async getAllCourses(
        @Ctx() context: IUserContext,

    ) {
        try {
            const user = context.userPayload
            // console.log({ user })
            // TODO: Add authorization logic here if needed
            // const user = await this.validateUser(payload.data?.authorization);

            const courses = await this.courseService.findAll({ organizationId: user.organizationId });
            return {
                success: true,
                data: courses,
                message: 'Courses retrieved successfully'
            };
        } catch (error) {
            throw new RpcException({
                message: error.message || 'An unexpected error occurred',
                code: 500,
                error: 'Internal Server Error'
            });
        }
    }

    @UseGuards(AuthGuard)
    @MessagePattern('courses.getCourseWithModule')
    async getCourseById(
        @Payload(new RpcValidationPipe())
        payload: { courseId: string; data?: { authorization?: string } },
    ) {
        try {
            const course = (await this.courseService.findCourseWithOrderedModules(payload.courseId))[0];
            return {
                success: true,
                data: course,
                message: 'Course retrieved successfully'
            };
        } catch (error) {
            handleRpcError(error)
        }
    }
    @MessagePattern('course.createCourse')
    @UseGuards(AuthGuard)
    async createCourse(
        @Payload(new RpcValidationPipe())
        payload: CreateCourseDto,
        @Ctx() context: IUserContext,

    ) {
        try {
            const user = context.userPayload
            return await this.courseService.create({ organizationId: user.organizationId.toString(), createdBy: user._id as string, ...payload });
        } catch (error) {
            handleRpcError(error)
        }
    }

    @MessagePattern('course.createModule')
    @UseGuards(AuthGuard)
    async createModule(
        @Payload(new RpcValidationPipe())
        payload: CreateCourseModuleDto,
        @Ctx() context: IUserContext,

    ) {
        try {
            const user = context.userPayload
            payload.organizationId = user.organizationId.toString();
            payload.createdBy = user._id as string;
            const createdModule = await this.courseModulesService.create(payload)
            return createdModule
        } catch (error) {
            handleRpcError(error)
        }
    }


    @MessagePattern("course.createContent")
    @UseGuards(AuthGuard)
    async createCourseContent(
        @Payload(new RpcValidationPipe())
        createCourseContentDto: CreateCourseContentDto,
        @Ctx() context: IUserContext,
    ) {
        try {
            const user = context.userPayload
            createCourseContentDto.organizationId = user.organizationId.toString()
            createCourseContentDto.createdBy = user.username as string

            const createdContent = await this.courseContentService.createCourseContent(createCourseContentDto)

            return {
                message: 'Course content created successfully',
                createdContent
            }
        } catch (error) {
            handleRpcError(error)
        }
    }


    // @MessagePattern('courses.getCourseById')
    // async getCourseById(
    //     @Payload(new RpcValidationPipe())
    //     payload: { id: string; courseId: string; data?: { authorization?: string } },
    // ) {
    //     try {
    //         // TODO: Add authorization logic here if needed
    //         // const user = await this.validateUser(payload.data?.authorization);

    //         const course = await this.courseService.findCourseWithOrderedModules(payload.courseId);
    //         return {
    //             success: true,
    //             data: course,
    //             message: 'Course retrieved successfully'
    //         };
    //     } catch (error) {
    //         if (error instanceof NotFoundException) {
    //             throw new RpcException({
    //                 message: error.message,
    //                 code: 404,
    //                 error: 'Not Found'
    //             });
    //         }
    //         throw new RpcException({
    //             message: error.message || 'An unexpected error occurred',
    //             code: 500,
    //             error: 'Internal Server Error'
    //         });
    //     }
    // }


    // @MessagePattern('course.updateModule')
    // @UseGuards(AuthGuard)
    // async updateModule(
    //     @Payload(new RpcValidationPipe())
    //     payload: { moduleId: string; data: Partial<CreateCourseModuleDto> },
    //     @Ctx() context: IUserContext,
    // ) {
    //     try {
    //         const updatedModule = await this.courseModulesService.update(payload.moduleId, payload.data)
    //         return updatedModule
    //     } catch (error) {
    //         handleRpcError(error)
    //     }
    // }

    // @MessagePattern('course.getModule')
    // @UseGuards(AuthGuard)
    // async getModule(
    //     @Payload(new RpcValidationPipe())
    //     payload: { moduleId: string },
    //     @Ctx() context: IUserContext,
    // ) {
    //     try {
    //         const module = await this.courseModulesService.findOne(payload.moduleId)
    //         return module
    //     } catch (error) {
    //         handleRpcError(error)
    //     }
    // }


    // @MessagePattern('courses.updateCourse')
    // async updateCourse(
    //     @Payload(new RpcValidationPipe())
    //     payload: { id: string; courseId: string; data: UpdateCourseDto & { authorization?: string } },
    // ) {
    //     try {
    //         // TODO: Add authorization logic here if needed
    //         // const user = await this.validateUser(payload.data.authorization);

    //         const result = await this.courseService.update(payload.courseId, payload.data);

    //         return {
    //             success: true,
    //             data: result,
    //             message: 'Course updated successfully'
    //         };
    //     } catch (error) {
    //         if (error instanceof NotFoundException) {
    //             throw new RpcException({
    //                 message: error.message,
    //                 code: 404,
    //                 error: 'Not Found'
    //             });
    //         }
    //         if (error instanceof BadRequestException) {
    //             throw new RpcException({
    //                 message: error.message,
    //                 code: 400,
    //                 error: 'Bad Request'
    //             });
    //         }
    //         throw new RpcException({
    //             message: error.message || 'An unexpected error occurred',
    //             code: 500,
    //             error: 'Internal Server Error'
    //         });
    //     }
    // }

    // @MessagePattern('courses.deleteCourse')
    // async deleteCourse(
    //     @Payload(new RpcValidationPipe())
    //     payload: { id: string; courseId: string; data?: { authorization?: string } },
    // ) {
    //     try {
    //         // TODO: Add authorization logic here if needed
    //         // const user = await this.validateUser(payload.data?.authorization);

    //         const result = await this.courseService.remove(parseInt(payload.courseId));

    //         return {
    //             success: true,
    //             data: result,
    //             message: 'Course deleted successfully'
    //         };
    //     } catch (error) {
    //         if (error instanceof NotFoundException) {
    //             throw new RpcException({
    //                 message: error.message,
    //                 code: 404,
    //                 error: 'Not Found'
    //             });
    //         }
    //         throw new RpcException({
    //             message: error.message || 'An unexpected error occurred',
    //             code: 500,
    //             error: 'Internal Server Error'
    //         });
    //     }
    // }

    // @MessagePattern('courses.addModuleToCourse')
    // async addModuleToCourse(
    //     @Payload(new RpcValidationPipe())
    //     payload: { id: string; courseId: string; moduleId: string; data?: { authorization?: string } },
    // ) {
    //     try {
    //         // TODO: Add authorization logic here if needed
    //         // const user = await this.validateUser(payload.data?.authorization);

    //         const result = await this.courseService.addModuleToCourse(payload.courseId, payload.moduleId);

    //         return {
    //             success: true,
    //             data: result,
    //             message: 'Module added to course successfully'
    //         };
    //     } catch (error) {
    //         if (error instanceof NotFoundException) {
    //             throw new RpcException({
    //                 message: error.message,
    //                 code: 404,
    //                 error: 'Not Found'
    //             });
    //         }
    //         throw new RpcException({
    //             message: error.message || 'An unexpected error occurred',
    //             code: 500,
    //             error: 'Internal Server Error'
    //         });
    //     }
    // }

    // @MessagePattern('courses.removeModuleFromCourse')
    // async removeModuleFromCourse(
    //     @Payload(new RpcValidationPipe())
    //     payload: { id: string; courseId: string; moduleId: string; data?: { authorization?: string } },
    // ) {
    //     try {
    //         // TODO: Add authorization logic here if needed
    //         // const user = await this.validateUser(payload.data?.authorization);

    //         const result = await this.courseService.removeModuleFromCourse(payload.courseId, payload.moduleId);

    //         return {
    //             success: true,
    //             data: result,
    //             message: 'Module removed from course successfully'
    //         };
    //     } catch (error) {
    //         if (error instanceof NotFoundException) {
    //             throw new RpcException({
    //                 message: error.message,
    //                 code: 404,
    //                 error: 'Not Found'
    //             });
    //         }
    //         throw new RpcException({
    //             message: error.message || 'An unexpected error occurred',
    //             code: 500,
    //             error: 'Internal Server Error'
    //         });
    //     }
    // }

    // @MessagePattern('courses.reorderModules')
    // async reorderModules(
    //     @Payload(new RpcValidationPipe())
    //     payload: { id: string; courseId: string; newOrder: string[]; data?: { authorization?: string } },
    // ) {
    //     try {
    //         // TODO: Add authorization logic here if needed
    //         // const user = await this.validateUser(payload.data?.authorization);

    //         const result = await this.courseService.reorderModules(payload.courseId, payload.newOrder);

    //         return {
    //             success: true,
    //             data: result,
    //             message: 'Module order updated successfully'
    //         };
    //     } catch (error) {
    //         if (error instanceof NotFoundException) {
    //             throw new RpcException({
    //                 message: error.message,
    //                 code: 404,
    //                 error: 'Not Found'
    //             });
    //         }
    //         if (error instanceof BadRequestException) {
    //             throw new RpcException({
    //                 message: error.message,
    //                 code: 400,
    //                 error: 'Bad Request'
    //             });
    //         }
    //         throw new RpcException({
    //             message: error.message || 'An unexpected error occurred',
    //             code: 500,
    //             error: 'Internal Server Error'
    //         });
    //     }
    // }

    // TODO: Implement user validation method
    // private async validateUser(authorization?: string) {
    //     if (!authorization) {
    //         throw new RpcException({
    //             message: 'Authorization token required',
    //             code: 401,
    //             error: 'Unauthorized'
    //         });
    //     }
    //     
    //     // Implement JWT validation logic here
    //     // Return user object or throw RpcException
    // }
}
