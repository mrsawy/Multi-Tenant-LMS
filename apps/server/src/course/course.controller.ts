import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard } from 'src/role/guards/permissions.guard';
import { RequiredPermissions } from 'src/role/permission.decorator';
import { Actions } from 'src/role/enum/Action.enum';
import { Subjects } from 'src/role/enum/subject.enum';
import { Conditions } from 'src/role/enum/Conditions.enum';
import { CaslAbilityFactory } from 'src/role/permissions.factory';
import { CourseContentService } from './courseContent.service';
import { CreateCourseContentDto } from './dto/create-course-content.dto';

@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
    private readonly caslAbilityFactory: CaslAbilityFactory,
    private readonly courseContentService: CourseContentService
  ) { }


  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.CREATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    const organization = req.user.organization;

    if (!organization) {
      throw new Error('Organization not found in request user');
    }

    const user = req.user;
    console.log({ user })
    if (!user || !user._id) {
      throw new Error('User not found in request');
    }

    return await this.courseService.create({ organization, createdBy: req.user._id, ...createCourseDto });
  }


  @UseGuards(PermissionsGuard)
  @RequiredPermissions({ action: Actions.UPDATE, subject: Subjects.COURSE })
  @UseGuards(AuthGuard)
  @Post("content")
  async createCourseContent(@Body() createCourseContentDto: CreateCourseContentDto, @Request() req) {

    createCourseContentDto.organizationId = req.user.organization._id
    createCourseContentDto.createdBy = req.user._id
    const createdContent = await this.courseContentService.createCourseContent(createCourseContentDto)

    return {
      message: 'Course content created successfully',
      createdContent
    }

  }




  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
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
}
