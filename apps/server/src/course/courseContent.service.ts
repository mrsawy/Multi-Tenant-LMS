import { Injectable, InternalServerErrorException, NotFoundException, Post, Request, UseGuards } from "@nestjs/common";
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


@Injectable()
export class CourseContentService {
    constructor(
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
        @InjectModel(CourseContent.name) private readonly courseContentModel: Model<CourseContent>
    ) { }

    async createCourseContent(createCourseContentDto: CreateCourseContentDto) {
        try {

            const { courseId } = createCourseContentDto;
            const course = await this.courseModel.findById(courseId);
            if (!course) {
                throw new NotFoundException("Course not found");
            }


            const { type } = createCourseContentDto.data;
            let createdContent: CourseContent | null = null;

            switch (type) {
                case CourseType.ARTICLE:
                    createdContent = await this.createArticle(createCourseContentDto)
                    break;

                default:
                    break;
            }

            return createdContent;
        } catch (error) {
            console.error(error);
            handleError(error);
        }
    }



    private async createArticle(createCourseContentDto: CreateCourseContentDto) {

        const { data } = createCourseContentDto;
        if (!('body' in data)) {
            throw new InternalServerErrorException("Article content must have a 'body' property.");
        }

        return await this.courseContentModel.create({ ...createCourseContentDto, type: CourseType.ARTICLE, body: (data as { body: string }).body })
    }

}
