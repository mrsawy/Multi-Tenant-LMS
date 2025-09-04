import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Post, Request, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Course } from "./entities/course.entity";
import { Model, ClientSession } from "mongoose";
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

    async createCourseContent(createCourseContentDto: CreateCourseContentDto, files?: Express.Multer.File[]) {
        const session: ClientSession = await this.connection.startSession();
        
        try {
            const result = await session.withTransaction(async () => {
                const { courseId, moduleId } = createCourseContentDto;
                
                // Verify course exists
                const course = await this.courseModel.findById(courseId).session(session);
                if (!course) {
                    throw new NotFoundException("Course not found");
                }
                
                // Verify module exists
                const module = await this.courseModuleModel.findById(moduleId).session(session);
                if (!module) {
                    throw new NotFoundException("Module not found");
                }

                const { type } = createCourseContentDto;
                let createdContent: CourseContent | null = null;

                switch (type) {
                    case ContentType.ARTICLE:
                        createdContent = await this.createArticle(createCourseContentDto, session)
                        break;

                    case ContentType.VIDEO:
                        createdContent = await this.createVideo(createCourseContentDto, session)
                        break;
                    case ContentType.ASSIGNMENT:
                        if (!files || files.length !== 1) {
                            throw new BadRequestException("One file is required for this content")
                        }
                        const file = files[0]
                        createdContent = await this.createAssignment(createCourseContentDto, file, session)
                        break;
                    default:
                        throw new BadRequestException("Invalid content type");
                }

                if (createdContent) {
                    // Add the new content ID to the module's contentsIds array at the end
                    await this.courseModuleModel.findByIdAndUpdate(
                        moduleId,
                        { $push: { contentsIds: createdContent._id } },
                        { session }
                    );
                }

                return createdContent;
            });
            
            return result;
        } catch (error) {
            throw handleError(error);
        } finally {
            await session.endSession();
        }
    }

    private async createAssignment(createCourseContentDto: CreateCourseContentDto, file: Express.Multer.File, session: ClientSession) {


        const mimeType = this.fileService.getMimeType(file.originalname);
        const allowedMimeTypes = ['pdf', 'word'];

        if (!allowedMimeTypes.includes(mimeType)) {
            throw new BadRequestException(
                "Invalid file type provided. Expected a video file (e.g., .pdf, .word)."
            );
        }



        const { fileKey } = await this.fileService.uploadToS3(file, `${FileCategory.ASSIGNMENTS}/${createCourseContentDto.createdBy}`);

        return this.courseContentModel.create([{ ...createCourseContentDto, fileKey }], { session }).then(docs => docs[0]);
    }

    private async createArticle(createCourseContentDto: CreateCourseContentDto, session: ClientSession) {
        return await this.courseContentModel.create([createCourseContentDto], { session }).then(docs => docs[0]);
    }



    private async createVideo(createCourseContentDto: CreateCourseContentDto, session: ClientSession) {
        const fileKey = createCourseContentDto.fileKey as string;

        const mimeType = this.fileService.getMimeType(fileKey);
        const allowedMimeTypes = ['mp4', 'mkv'];

        if (!allowedMimeTypes.includes(mimeType)) {
            throw new BadRequestException(
                "Invalid file type provided. Expected a video file (e.g., .mp4, .mkv)."
            );
        }

        const isValid = await this.fileService.validateFileKeys([fileKey]);
        if (!isValid) {
            throw new BadRequestException(
                "Invalid file key provided. Video file must be successfully uploaded before creating content."
            );
        }

        return this.courseContentModel.create([createCourseContentDto], { session }).then(docs => docs[0]);
    }



}
