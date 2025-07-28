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
import { CourseType } from './enum/courseType.enum';
// import { FileService } from "src/file/file.service";
import * as Busboy from 'busboy';
import { FileService } from "src/file/file.service";
import { FileCategory } from "src/file/enum/fileCategory.enum";


@Injectable()
export class CourseContentService {
    constructor(
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
        @InjectModel(CourseContent.name) private readonly courseContentModel: Model<CourseContent>,
        private readonly fileService: FileService
    ) { }

    async createCourseContent(createCourseContentDto: CreateCourseContentDto, files?: Express.Multer.File[]) {
        const { courseId } = createCourseContentDto;
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new NotFoundException("Course not found");
        }

        const { type } = createCourseContentDto;
        let createdContent: CourseContent | null = null;

        switch (type) {
            case CourseType.ARTICLE:
                createdContent = await this.createArticle(createCourseContentDto)
                break;

            case CourseType.VIDEO:
                createdContent = await this.createVideo(createCourseContentDto)
                break;
            case CourseType.ASSIGNMENT:

                if (!files || files.length !== 1) {
                    throw new BadRequestException("One file is required for this content")
                }
                const file = files[0]
                createdContent = await this.createAssignment(createCourseContentDto, file)
                break;
            default:
                break;
        }

        return createdContent;
    }

    private async createAssignment(createCourseContentDto: CreateCourseContentDto, file: Express.Multer.File) {


        const mimeType = this.fileService.getMimeType(file.originalname);
        const allowedMimeTypes = ['pdf', 'word'];

        if (!allowedMimeTypes.includes(mimeType)) {
            throw new BadRequestException(
                "Invalid file type provided. Expected a video file (e.g., .pdf, .word)."
            );
        }



        const { fileKey } = await this.fileService.uploadToS3(file, `${FileCategory.ASSIGNMENTS}/${createCourseContentDto.createdBy}`);

        return this.courseContentModel.create({ ...createCourseContentDto, fileKey });
    }

    private async createArticle(createCourseContentDto: CreateCourseContentDto) {
        return await this.courseContentModel.create(createCourseContentDto)
    }



    private async createVideo(createCourseContentDto: CreateCourseContentDto) {
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

        return this.courseContentModel.create(createCourseContentDto);
    }



}
