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
import { CourseService } from '../services/course.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { PermissionsGuard } from 'src/role/guards/permissions.guard';
import { RequiredPermissions } from 'src/role/permission.decorator';
import { Actions } from 'src/role/enum/Action.enum';
import { Subjects } from 'src/role/enum/subject.enum';
import { CourseContentService } from '../services/courseContent.service';

import { CourseModulesService } from '../services/courseModules.service';
import { EnrollmentService } from 'src/enrollment/enrollment.service';
import { QuizService } from '../services/quiz.service';
import { SubmitQuizDto } from '../../enrollment/dto/quiz-submission.dto';
import { IUserRequest } from 'src/auth/interfaces/IUserRequest.interface';

@Controller('content')
export class ContentControllerHttp {
  constructor(

  ) { }

}
