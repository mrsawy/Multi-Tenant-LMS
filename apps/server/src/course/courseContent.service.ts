import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Post, Request, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Course } from "./entities/course.entity";
import { Model } from "mongoose";
import { CourseContent } from "./entities/course-content.entity";
import { AuthGuard } from "src/auth/auth.guard";
import { PermissionsGuard } from "src/role/guards/permissions.guard";
import { RequiredPermissions } from "src/role/permission.decorator";
import { Actions } from "src/role/enum/Action.enum";
import { Subjects } from "src/role/enum/subject.enum";
import { CreateCourseContentDto } from "./dto/create-course-content.dto";
import { handleError } from "src/utils/errorHandling";
import { ContentType } from './enum/contentType.enum';
// import { FileService } from "src/file/file.service";
import * as Busboy from 'busboy';
import { FileService } from "src/file/file.service";
import { FileCategory } from "src/file/enum/fileCategory.enum";
import { CourseModule } from "./entities/course-module.entity";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Injectable()
export class CourseContentService {
    constructor(
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
        @InjectModel(CourseContent.name) private readonly courseContentModel: Model<CourseContent>,
        @InjectModel(CourseModule.name) private readonly courseModuleModel: Model<CourseModule>,
        @InjectConnection() private readonly connection: Connection,
        private readonly fileService: FileService
    ) { }

    async createCourseContent(createCourseContentDto: CreateCourseContentDto) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const { courseId, moduleId } = createCourseContentDto;

            const course = await this.courseModel.findById(courseId).session(session);
            if (!course) throw new NotFoundException("Course not found");

            const module = await this.courseModuleModel.findById(moduleId).session(session);
            if (!module) throw new NotFoundException("Module not found")

            const [createdContent] = await this.courseContentModel.create([createCourseContentDto], { session });

            await this.courseModuleModel.findByIdAndUpdate(moduleId, { $push: { contentsIds: createdContent._id } }, { session, new: true });
            await session.commitTransaction();
            return createdContent;
        } catch (error) {
            await session.abortTransaction();
            throw error
        } finally {
            session.endSession();
        }
    }
}