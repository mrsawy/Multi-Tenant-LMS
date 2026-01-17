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
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { IUserContext } from 'src/utils/types/IUserContext.interface';
import { handleRpcError } from 'src/utils/errorHandling';
import { CreateCourseModuleDto } from '../dto/create-course-module.dto';
import { CourseModulesService } from '../services/courseModules.service';
import { CreateCourseContentDto } from '../dto/create-course-content.dto';
import { CourseContentService } from '../services/courseContent.service';
import { PaginateOptions } from 'mongoose';
import { ICourseFilters } from 'src/utils/types/CourseFilters';
import { SubmitQuizDto } from '../../enrollment/dto/quiz-submission.dto';
import { QuizService } from '../services/quiz.service';
import { EnrollmentService } from 'src/enrollment/services/enrollment.service';
import { ContentType } from '../enum/contentType.enum';
import { VideoType } from '../enum/videoType.enum';
import { FileService } from 'src/file/file.service';
import { ProjectService } from '../services/project.service';
import { LiveSessionService } from '../services/liveSession.service';
import { SubmitProjectDto } from '../../enrollment/dto/project-submission.dto';
import { MarkLiveSessionAttendanceDto } from '../../enrollment/dto/live-session-attendance.dto';

@Controller()
export class ContentControllerMessage {
  constructor(
    private courseService: CourseService,
    private readonly quizService: QuizService,
    private readonly courseContentService: CourseContentService,
    // private readonly enrollmentService: EnrollmentService,
    private readonly fileService: FileService,
    private readonly projectService: ProjectService,
    private readonly liveSessionService: LiveSessionService,
  ) { }

  @UseGuards(AuthGuard)
  @MessagePattern('course.createContent')
  async createCourseContent(
    @Payload(new RpcValidationPipe())
    createCourseContentDto: CreateCourseContentDto,
    @Ctx() context: IUserContext,
  ) {
    try {
      const user = context.userPayload;
      createCourseContentDto.organizationId = user.organizationId.toString();
      createCourseContentDto.createdBy = user.username;

      const createdContent =
        await this.courseContentService.createCourseContent(
          createCourseContentDto,
        );

      return {
        message: 'Course content created successfully',
        createdContent,
      };
    } catch (error) {
      handleRpcError(error);
    }
  }

  @UseGuards(AuthGuard)
  @MessagePattern('course.getContentsByModuleId')
  async getContentsByModuleId(
    @Payload(new RpcValidationPipe())
    payload: {
      moduleId: string;
    },
  ) {
    try {
      const result = await this.courseContentService.getContentsByModuleId(
        payload.moduleId,
      );
      return result;
    } catch (error) {
      handleRpcError(error);
    }
  }

  @UseGuards(AuthGuard)
  @MessagePattern('course.getContent')
  async getContent(
    @Payload(new RpcValidationPipe())
    payload: {
      contentId: string;
    },
  ) {
    const result = await this.courseContentService.getContent(payload.contentId);
    if (result.type === ContentType.VIDEO && 'videoType' in result) {
      if (result.videoType === VideoType.UPLOAD) {
        const fileUrl = await this.fileService.getFileUrl(result.fileKey);
        result.videoUrl = fileUrl;
      }
    }

    return result;
  }

  @UseGuards(AuthGuard)
  @MessagePattern('course.deleteContent')
  async deleteContent(
    @Payload(new RpcValidationPipe())
    payload: {
      contentId: string;
    },
  ) {
    try {
      return await this.courseContentService.deleteContents([
        payload.contentId,
      ]);
    } catch (error) {
      handleRpcError(error);
    }
  }

  @MessagePattern('course.updateContent')
  @UseGuards(AuthGuard)
  async updateContent(
    @Payload(new RpcValidationPipe())
    payload: CreateCourseContentDto & { contentId: string },
  ) {
    try {
      return await this.courseContentService.updateCourseContent(payload);
    } catch (error) {
      handleRpcError(error);
    }
  }


  @MessagePattern('course.getQuizAttemptsLeft')
  @UseGuards(AuthGuard)
  async getQuizAttemptsLeft(
    @Payload(new RpcValidationPipe())
    payload: { contentId: string },
    @Ctx() context: IUserContext,
  ) {
    try {
      const studentId = context.userPayload._id.toString();
      const result = await this.quizService.getQuizAttemptsLeft(
        payload.contentId,
        studentId,
      );

      return result;
    } catch (error) {
      handleRpcError(error);
    }
  }
  @MessagePattern('course.getProjectSubmissions')
  @UseGuards(AuthGuard)
  async getProjectSubmissions(
    @Payload(new RpcValidationPipe())
    payload: { projectId: string; studentId?: string },
    @Ctx() context: IUserContext,
  ) {
    try {
      const studentId = payload.studentId || context.userPayload._id.toString();
      const result = await this.projectService.getProjectSubmissions(
        payload.projectId,
        studentId,
      );

      return result;
    } catch (error) {
      handleRpcError(error);
    }
  }

  @MessagePattern('course.gradeProject')
  @UseGuards(AuthGuard)
  async gradeProject(
    @Payload(new RpcValidationPipe())
    payload: {
      projectId: string;
      studentId: string;
      score: number;
      feedback?: string;
    },
  ) {
    try {
      const result = await this.projectService.gradeProjectSubmission(
        payload.projectId,
        payload.studentId,
        payload.score,
        payload.feedback,
      );

      return {
        message: 'Project graded successfully',
        result,
        success: true,
      };
    } catch (error) {
      handleRpcError(error);
    }
  }


  @MessagePattern('course.getLiveSessionAttendance')
  @UseGuards(AuthGuard)
  async getLiveSessionAttendance(
    @Payload(new RpcValidationPipe())
    payload: { liveSessionId: string; studentId?: string },
    @Ctx() context: IUserContext,
  ) {
    try {
      const studentId = payload.studentId || context.userPayload._id.toString();
      const result = await this.liveSessionService.getLiveSessionAttendance(
        payload.liveSessionId,
        studentId,
      );

      return result;
    } catch (error) {
      handleRpcError(error);
    }
  }
}
