import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard } from 'src/role/guards/permissions.guard';
import { RequiredPermissions } from 'src/role/permission.decorator';
import { Actions } from 'src/role/enum/Action.enum';
import { Subjects } from 'src/role/enum/subject.enum';
import { CourseContentService } from './courseContent.service';
import { CreateCourseContentDto } from './dto/create-course-content.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';
import { CourseModulesService } from './courseModules.service';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';

@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly courseContentService: CourseContentService,
    private readonly courseModulesService: CourseModulesService
  ) { }


  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.CREATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req: IUserRequest) {
    const organizationId = `${req.user.organizationId}`;

    const user = req.user;
    console.log({ user })
    if (!user || !user._id) {
      throw new Error('User not found in request');
    }

    return await this.courseService.create({ organizationId, createdBy: req.user._id as string, ...createCourseDto });
  }


  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Post("content")
  async createCourseContent(
    @Body() createCourseContentDto: CreateCourseContentDto,
    @Req() req: IUserRequest,
  ) {
    createCourseContentDto.organizationId = req.user.organizationId.toString()
    createCourseContentDto.createdBy = req.user.username as string

    const createdContent = await this.courseContentService.createCourseContent(createCourseContentDto)

    return {
      message: 'Course content created successfully',
      createdContent
    }
  }



  @Get()
  findAll() {
    return `this.courseService.findAll()`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findCourseWithOrderedModules(id);
  }


  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }



  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.READ, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Get('module/:id/:moduleId')
  async getModuleWithOrderedContents(@Param('id') id: string, @Param('moduleId') moduleId: string) {
    return await this.courseModulesService.findModuleWithOrderedContents(moduleId);
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.READ, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Post("/module")
  async createModule(@Body() createModuleDto: CreateCourseModuleDto, @Req() req: IUserRequest) {
    createModuleDto.organizationId = (req.user.organizationId as any).toString();
    createModuleDto.createdBy = (req.user._id as any).toString();
    return await this.courseModulesService.create(createModuleDto);
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Patch("/module/:moduleId")
  async updateModule(@Param('moduleId') moduleId: string, @Body() updateModuleDto: Partial<CreateCourseModuleDto>) {
    return await this.courseModulesService.update(moduleId, updateModuleDto);
  }


  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Patch(":id/reorder")
  async reorderModules(
    @Param('id') id: string,
    @Body() body: { newOrder: string[] },
  ) {
    return await this.courseService.reorderModules(id, body.newOrder);
  }

  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Post(":id/module/:moduleId")
  async addModuleToCourse(
    @Param('id') id: string,
    @Param('moduleId') moduleId: string,
  ) {
    return await this.courseService.addModuleToCourse(id, moduleId);
  }


}
