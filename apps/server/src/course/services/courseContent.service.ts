import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from '../entities/course.entity';
import mongoose, { ClientSession, Model } from 'mongoose';
import * as Busboy from 'busboy';
import { FileService } from 'src/file/file.service';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CourseContentDocument } from 'src/utils/types/content.interface';
import { CourseContent } from '../entities/course-content.entity';

import { CourseModulesService } from './courseModules.service';
import { CreateCourseContentDto } from '../dto/create-course-content.dto';
import { ContentType } from '../enum/contentType.enum';
import { CourseModuleEntity } from '../entities/course-module.entity';

@Injectable()
export class CourseContentService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
    @InjectModel(CourseContent.name)
    private readonly courseContentModel: Model<CourseContent>,
    @InjectModel(CourseModuleEntity.name)
    private readonly courseModuleModel: Model<CourseModuleEntity>,
    @InjectConnection() private readonly connection: Connection,
    private readonly fileService: FileService,
    @Inject(forwardRef(() => CourseModulesService))
    private readonly courseModuleService: CourseModulesService,
  ) { }

  async createCourseContent(createCourseContentDto: CreateCourseContentDto) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { courseId, moduleId } = createCourseContentDto;

      const course = await this.courseModel.findById(courseId).session(session);
      if (!course) throw new NotFoundException('Course not found');

      const module = await this.courseModuleModel
        .findById(moduleId)
        .session(session);
      if (!module) throw new NotFoundException('Module not found');

      const [createdContent] = await this.courseContentModel.create(
        [createCourseContentDto],
        { session },
      );
      await this.courseModuleModel.findByIdAndUpdate(
        moduleId,
        { $push: { contentsIds: createdContent._id } },
        { session, new: true },
      );

      await session.commitTransaction();
      return createdContent;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateCourseContent(
    createCourseContentDto: CreateCourseContentDto & { contentId: string },
  ) {
    console.dir(
      {
        sp: `updateCourseContent`,
        createCourseContentDto,
      },
      { depth: null },
    );

    const {
      contentId,
      type: discriminatorKey,
      ...updateData
    } = createCourseContentDto;

    let modelToUse = this.courseContentModel;

    if (
      this.courseContentModel.discriminators &&
      this.courseContentModel.discriminators[discriminatorKey]
    ) {
      modelToUse = this.courseContentModel.discriminators[discriminatorKey];
    }

    console.log(`modelToUse`, modelToUse, modelToUse.name);
    const result = await modelToUse.findByIdAndUpdate(contentId, updateData, {
      new: true,
      runValidators: true,
    });

    return result;
  }

  async deleteContents(
    contentIds: (string | mongoose.Types.ObjectId)[],
    session: ClientSession | null = null,
  ) {
    let localSession = false;
    if (!session) {
      session = await this.connection.startSession();
      session.startTransaction();
      localSession = true;
    }

    try {
      const objectIds = contentIds.map((id) => new mongoose.Types.ObjectId(id));
      const contents = await this.courseContentModel
        .find({ _id: { $in: objectIds } })
        .session(session);
      if (contents.length !== contentIds.length) {
        throw new NotFoundException('Contents not found');
      }
      await this.courseModuleService.removeContentFromModule(
        contents[0].moduleId.toString(),
        contentIds,
        session,
      );
      for (const content of contents) {
        const fileKey = (content as any).fileKey;
        if (fileKey && typeof fileKey === 'string') {
          await this.fileService.deleteFile(fileKey);
        }
      }
      const result = await this.courseContentModel
        .deleteMany({ _id: { $in: objectIds } })
        .session(session);

      if (localSession) {
        await session.commitTransaction();
      }

      return result;
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (localSession) {
        session.endSession();
      }
    }
  }

  async getContentsByModuleId(
    moduleId: string,
    session: ClientSession | null = null,
  ) {
    const modules = await this.courseModuleModel
      .aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(moduleId) } },
        {
          $lookup: {
            from: 'course_contents',
            localField: 'contentsIds',
            foreignField: '_id',
            as: 'contents',
          },
        },
        {
          $addFields: {
            contents: {
              $map: {
                input: '$contentsIds',
                as: 'contentId',
                in: {
                  $arrayElemAt: [
                    '$contents',
                    {
                      $indexOfArray: ['$contents._id', '$$contentId'],
                    },
                  ],
                },
              },
            },
          },
        },
        // Remove quizSubmissions from quiz contents, submissions from project contents, and attendance from live session contents
        {
          $addFields: {
            contents: {
              $map: {
                input: '$contents',
                as: 'content',
                in: {
                  $cond: {
                    if: { $eq: ['$$content.type', ContentType.QUIZ] },
                    then: {
                      $mergeObjects: [
                        '$$content',
                        { quizSubmissions: '$$REMOVE' },
                      ],
                    },
                    else: {
                      $cond: {
                        if: { $eq: ['$$content.type', ContentType.PROJECT] },
                        then: {
                          $mergeObjects: [
                            '$$content',
                            { submissions: '$$REMOVE' },
                          ],
                        },
                        else: {
                          $cond: {
                            if: {
                              $eq: [
                                '$$content.type',
                                ContentType.LIVE_SESSION,
                              ],
                            },
                            then: {
                              $mergeObjects: [
                                '$$content',
                                { attendance: '$$REMOVE' },
                              ],
                            },
                            else: '$$content',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      ])
      .session(session);

    console.dir({ modules }, { depth: null });
    return modules[0];
  }

  async getContent(contentId: string, session: ClientSession | null = null) {
    const content = (await this.courseContentModel
      .findById(contentId)
      .session(session)) as CourseContentDocument | null;

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    // Remove quizSubmissions if it's a quiz, submissions if it's a project, or attendance if it's a live session
    const contentObj = content.toObject();
    if (content.type === ContentType.QUIZ && 'quizSubmissions' in contentObj) {
      const { quizSubmissions, ...contentWithoutSubmissions } = contentObj;
      return contentWithoutSubmissions as CourseContentDocument;
    }
    if (
      content.type === ContentType.PROJECT &&
      'submissions' in contentObj
    ) {
      const { submissions, ...contentWithoutSubmissions } = contentObj;
      return contentWithoutSubmissions as CourseContentDocument;
    }
    if (
      content.type === ContentType.LIVE_SESSION &&
      'attendance' in contentObj
    ) {
      const { attendance, ...contentWithoutSubmissions } = contentObj;
      return contentWithoutSubmissions as CourseContentDocument;
    }

    return content;
  }
}
