import { Controller, NotFoundException, BadRequestException, InternalServerErrorException, UseGuards } from "@nestjs/common";
import { CourseService } from "./course.service";
import { Ctx, MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { RpcValidationPipe } from 'src/utils/RpcValidationPipe';
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { AuthGuard } from "src/auth/auth.guard";
import { IUserContext } from "src/utils/types/IUserContext.interface";


@Controller()
export class CourseControllerMessage {
    constructor(private courseService: CourseService) { }

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

    @MessagePattern('course.createCourse')
    async createCourse(
        @Payload(new RpcValidationPipe())
        payload: CreateCourseDto,
    ) {

        console.log({ payload })
        return "course created"
    }

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
