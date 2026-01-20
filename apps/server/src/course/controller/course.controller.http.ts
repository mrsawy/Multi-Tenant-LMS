import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Req,
  UseInterceptors,
  UploadedFiles,
  Query,
  Put,
} from '@nestjs/common';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard } from 'src/role/guards/permissions.guard';
import { RequiredPermissions } from 'src/role/permission.decorator';
import { Actions } from 'src/role/enum/Action.enum';
import { Subjects } from 'src/role/enum/subject.enum';
import { CreateCourseContentDto } from './../dto/create-course-content.dto';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';
import { CourseModulesService } from '../services/courseModules.service';
import { CreateCourseModuleDto } from './../dto/create-course-module.dto';
import { ICourseFilters } from 'src/utils/types/CourseFilters';
import { FileService } from 'src/file/file.service';
import { ContentType } from './../enum/contentType.enum';
import { VideoType } from './../enum/videoType.enum';
import { CourseService } from '../services/course.service';
import { CourseContentService } from '../services/courseContent.service';
import { QuizService } from '../services/quiz.service';

@Controller('course')
export class CourseControllerHttp {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseContentService: CourseContentService,
    private readonly courseModulesService: CourseModulesService,
    private readonly quizService: QuizService,
    private readonly fileService: FileService,
  ) { }

  @Get()
  async findAll(@Query() options: ICourseFilters) {
    const courses = await this.courseService.findAll({}, options);
    return courses;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.courseService.getCourseWithOrderedModules(id, true);
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.CREATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createCourseDto: CreateCourseDto,
    @Request() req: IUserRequest,
  ) {
    const organizationId = `${req.user.organizationId}`;

    const user = req.user;
    console.log({ user });
    if (!user || !user._id) {
      throw new Error('User not found in request');
    }

    return await this.courseService.create({
      organizationId,
      createdBy: req.user._id.toString(),
      ...createCourseDto,
    });
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Post('content')
  async createCourseContent(
    @Body() createCourseContentDto: CreateCourseContentDto,
    @Req() req: IUserRequest,
  ) {
    createCourseContentDto.organizationId = req.user.organizationId.toString();
    createCourseContentDto.createdBy = req.user.username.toString();

    const createdContent = await this.courseContentService.createCourseContent(
      createCourseContentDto,
    );

    return {
      message: 'Course content created successfully',
      createdContent,
    };
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.READ, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Get('module/:id/:moduleId')
  async getModuleWithOrderedContents(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
  ) {
    return await this.courseModulesService.findModuleWithOrderedContents(
      moduleId,
    );
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.READ, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Post('/module')
  async createModule(
    @Body() createModuleDto: CreateCourseModuleDto,
    @Req() req: IUserRequest,
  ) {
    createModuleDto.organizationId = (
      req.user.organizationId as any
    ).toString();
    createModuleDto.createdBy = (req.user._id as any).toString();
    return await this.courseModulesService.create(createModuleDto);
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Patch('/module/:moduleId')
  async updateModule(
    @Param('moduleId') moduleId: string,
    @Body() updateModuleDto: Partial<CreateCourseModuleDto>,
  ) {
    return await this.courseModulesService.update(moduleId, updateModuleDto);
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Patch(':id/reorder')
  async reorderModules(
    @Param('id') id: string,
    @Body() body: { newOrder: string[] },
  ) {
    return await this.courseService.reorderModules(id, body.newOrder);
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Post(':id/module/:moduleId')
  async addModuleToCourse(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
  ) {
    return await this.courseService.addModuleToCourse(id, moduleId);
  }
  //  need update (make the fileKey valid Url )
  @UseGuards(AuthGuard)
  @Get('/content/:id')
  async getContent(@Param('id') id: string) {
    const result = await this.courseContentService.getContent(id);
    if (result.type === ContentType.VIDEO && 'videoType' in result) {
      if (result.videoType === VideoType.UPLOAD) {
        const fileUrl = await this.fileService.getFileUrl(result.fileKey);
        result.videoUrl = fileUrl;
      }
    }

    return result;
  }

}
