import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CourseModule } from "./entities/course-module.entity";
import mongoose, { Model } from "mongoose";
import { CreateCourseModuleDto } from "./dto/create-course-module.dto";


@Injectable()
export class CourseModulesService {
    constructor(
        @InjectModel(CourseModule.name) private readonly courseModuleModel: Model<CourseModule>
    ) { }

    async create(createCourseModuleDto: CreateCourseModuleDto) {
        const courseModule = await this.courseModuleModel.create(createCourseModuleDto);
        return courseModule;
    }

    async findAll(courseId: string) {
        const courseModules = await this.courseModuleModel.find({ courseId }).exec();
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
                    as: 'contents'
                }
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
                                        $indexOfArray: [
                                            '$contents._id',
                                            '$$contentId'
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                }
            }
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
            const currentContentIds = module.contentsIds.map(id => id.toString());

            // Validate that all new IDs exist in current contents
            const invalidIds = newOrder.filter(id => !currentContentIds.includes(id));
            if (invalidIds.length > 0) {
                throw new BadRequestException(`Invalid content IDs: ${invalidIds.join(', ')}`);
            }

            // Validate that all current contents are included in new order
            const missingIds = currentContentIds.filter(id => !newOrder.includes(id));
            if (missingIds.length > 0) {
                throw new BadRequestException(`Missing content IDs: ${missingIds.join(', ')}`);
            }

            // Convert to ObjectIds and update
            const validIds = newOrder.map(id => new mongoose.Types.ObjectId(id));

            const result = await this.courseModuleModel.updateOne(
                { _id: moduleId },
                { $set: { contentsIds: validIds } }
            );

            return {
                message: 'Content order updated successfully',
                updated: true,
                newOrder: validIds
            };
        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(error);
        }
    }

    async addContentToModule(moduleId: string, contentId: string) {
        try {
            const foundedCourseContent = await this.findOne(contentId)
            if (!foundedCourseContent) throw new NotFoundException('Course content not found');
            const result = await this.courseModuleModel.updateOne(
                { _id: moduleId },
                { $addToSet: { contentsIds: new mongoose.Types.ObjectId(contentId) } }
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

    async removeContentFromModule(moduleId: string, contentId: string) {
        try {
            const result = await this.courseModuleModel.updateOne(
                { _id: moduleId },
                { $pull: { contentsIds: new mongoose.Types.ObjectId(contentId) } }
            );

            if (result.matchedCount === 0) {
                throw new NotFoundException('Course module not found');
            }

            return {
                message: 'Content removed from module successfully',
                updated: true,
            };
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(error);
        }
    }

}
