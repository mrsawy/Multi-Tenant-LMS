import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CourseModuleEntity } from '../entities/course-module.entity';
import mongoose, { Model, Connection, ClientSession } from 'mongoose';
import { CreateCourseModuleDto } from '../dto/create-course-module.dto';
import { CourseService } from './course.service';
import { InjectConnection } from '@nestjs/mongoose';
import { CourseContentService } from './courseContent.service';

@Injectable()
export class CourseModulesService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel('CourseModule')
    private readonly courseModuleModel: Model<CourseModuleEntity>,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
    @Inject(forwardRef(() => CourseContentService))
    private readonly courseContentService: CourseContentService,
  ) { }

  async create(createCourseModuleDto: CreateCourseModuleDto) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      // Create and save the course module within the transaction
      const courseModule = new this.courseModuleModel(createCourseModuleDto);
      await courseModule.save({ session });

      // Add the module to the course (pass the same session)
      await this.courseService.addModuleToCourse(
        createCourseModuleDto.courseId,
        courseModule._id.toString(),
        session,
      );

      await session.commitTransaction();
      return courseModule;
    } catch (error) {
      await session.abortTransaction();
      throw error; // rethrow to handle at a higher level
    } finally {
      await session.endSession();
    }
  }

  async findAll(courseId: string) {
    const courseModules = await this.courseModuleModel
      .find({ courseId })
      .exec();
    return courseModules;
  }

  async findOne(id: string) {
    const courseModule = await this.courseModuleModel.findById(id).exec();
    return courseModule;
  }

  async findModuleWithOrderedContents(moduleId: string) {
    return await this.courseModuleModel.aggregate([
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
    ]);
  }

  async reorderContents(moduleId: string, newOrder: string[]) {
    try {
      // First, get the current module to validate
      const module = await this.courseModuleModel.findById(moduleId);
      if (!module) {
        throw new NotFoundException('Course module not found');
      }

      // Get current content IDs as strings for comparison
      const currentContentIds = module.contentsIds.map((id) => id.toString());

      // Validate that all new IDs exist in current contents
      const invalidIds = newOrder.filter(
        (id) => !currentContentIds.includes(id),
      );
      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `Invalid content IDs: ${invalidIds.join(', ')}`,
        );
      }

      // Validate that all current contents are included in new order
      const missingIds = currentContentIds.filter(
        (id) => !newOrder.includes(id),
      );
      if (missingIds.length > 0) {
        throw new BadRequestException(
          `Missing content IDs: ${missingIds.join(', ')}`,
        );
      }

      // Convert to ObjectIds and update
      const validIds = newOrder.map((id) => new mongoose.Types.ObjectId(id));

      const result = await this.courseModuleModel.updateOne(
        { _id: moduleId },
        { $set: { contentsIds: validIds } },
      );

      return {
        message: 'Content order updated successfully',
        updated: true,
        newOrder: validIds,
      };
    } catch (error) {
      console.error(error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async addContentToModule(moduleId: string, contentId: string) {
    try {
      const foundedCourseContent = await this.findOne(contentId);
      if (!foundedCourseContent)
        throw new NotFoundException('Course content not found');
      const result = await this.courseModuleModel.updateOne(
        { _id: moduleId },
        { $addToSet: { contentsIds: new mongoose.Types.ObjectId(contentId) } },
      );

      if (result.matchedCount === 0) {
        throw new NotFoundException('Course module not found');
      }

      return {
        message: 'Content added to module successfully',
        updated: true,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async removeContentFromModule(
    moduleId: string,
    contentIds: (string | mongoose.Types.ObjectId)[],
    session: ClientSession | null = null,
  ) {
    try {
      const objectIds = contentIds.map((id) => new mongoose.Types.ObjectId(id));
      const result = await this.courseModuleModel
        .updateOne(
          { _id: moduleId },
          { $pull: { contentsIds: { $in: objectIds } } },
        )
        .session(session);
      if (result.matchedCount === 0) {
        throw new NotFoundException('Course module not found');
      }
      return {
        message: 'Contents removed from module successfully',
        updated: true,
        result,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to remove contents');
    }
  }

  async update(moduleId: string, updateData: Partial<CreateCourseModuleDto>) {
    try {
      const module = await this.courseModuleModel.findById(moduleId);
      if (!module) {
        throw new NotFoundException('Course module not found');
      }

      const updatedModule = await this.courseModuleModel.findByIdAndUpdate(
        moduleId,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      return updatedModule;
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async deleteModules(moduleIds: string[], session?: ClientSession) {
    if (!session) {
      session = await this.connection.startSession();
      session.startTransaction();
    }

    try {
      // Validate that all modules exist
      const modules = await this.courseModuleModel
        .find({
          _id: { $in: moduleIds.map((id) => new mongoose.Types.ObjectId(id)) },
        })
        .session(session);

      if (modules.length !== moduleIds.length) {
        const foundIds = modules.map((m) =>
          (m._id as mongoose.Types.ObjectId).toString(),
        );
        const missingIds = moduleIds.filter((id) => !foundIds.includes(id));
        throw new NotFoundException(
          `Modules not found: ${missingIds.join(', ')}`,
        );
      }

      // Get course IDs to update
      const courseIds = [
        ...new Set(modules.map((module) => module.courseId.toString())),
      ];

      // Delete all contents for each module first
      for (const module of modules) {
        if (module.contentsIds && module.contentsIds.length > 0) {
          await this.courseContentService.deleteContents(
            module.contentsIds,
            session,
          );
        }
      }

      // Delete the modules
      await this.courseModuleModel
        .deleteMany({
          _id: { $in: moduleIds.map((id) => new mongoose.Types.ObjectId(id)) },
        })
        .session(session);

      // Remove module IDs from course modulesIds arrays
      for (const courseId of courseIds) {
        // Get modules that belong to this specific course
        const courseModuleIds = modules
          .filter((module) => module.courseId.toString() === courseId)
          .map((module) => (module._id as mongoose.Types.ObjectId).toString());

        await this.courseService.removeModulesFromCourse(
          courseId,
          courseModuleIds,
          session,
        );
      }

      await session.commitTransaction();

      return {
        message: `Successfully deleted ${moduleIds.length} module(s)`,
        deletedCount: moduleIds.length,
        deletedModuleIds: moduleIds,
      };
    } catch (error) {
      await session.abortTransaction();
      console.error('Error deleting modules:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete modules');
    } finally {
      await session.endSession();
    }
  }

  async deleteModule(moduleId: string) {
    return this.deleteModules([moduleId]);
  }
}
