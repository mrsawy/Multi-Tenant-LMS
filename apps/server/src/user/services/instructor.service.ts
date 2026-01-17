import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, {
    PaginateModel,
    PaginateOptions,
    Types,
} from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { handleError } from 'src/utils/errorHandling';
import { convertObjectValuesToObjectId } from 'src/utils/ObjectId.utils';
import { Roles } from 'src/role/enum/Roles.enum';
import { remove, removePassword } from 'src/utils/removeSensitiveData';
import { Role } from 'src/role/entities/role.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class InstructorService {
    constructor(
        @InjectModel(User.name) private readonly userModel: PaginateModel<User>,
    ) { }

    async findAll(
        options: PaginateOptions,
        filters?: mongoose.RootFilterQuery<User>,
    ) {
        const additionalFilters = convertObjectValuesToObjectId(filters || {});
        const { roleName, categoriesIds, ...filtersWithoutRoleName } = additionalFilters;

        const page = options.page || 1;
        const limit = options.limit || 10;
        const skip = (page - 1) * limit;
        const sort = options.sort || { createdAt: -1 };

        // Build match stage with the new conditions and additional filters
        const matchStage: any = {
            roleName: {
                $regex: /^instructor$/i,
            },
            ...filtersWithoutRoleName,
        };

        // Handle categoriesIds filter - if provided, use $in to match instructors with that category
        if (categoriesIds) {
            matchStage.categoriesIds = {
                $in: Array.isArray(categoriesIds) ? categoriesIds : [categoriesIds],
            };
        } else {
            // Otherwise, just ensure it's an array type
            matchStage.categoriesIds = {
                $type: 'array',
            };
        }

        const dataPipeline: any[] = [
            {
                $addFields: {
                    categoriesIds: {
                        $map: {
                            input: '$categoriesIds',
                            as: 'id',
                            in: {
                                $cond: [
                                    {
                                        $eq: [
                                            {
                                                $type: '$$id',
                                            },
                                            'string',
                                        ],
                                    },
                                    {
                                        $toObjectId: '$$id',
                                    },
                                    '$$id',
                                ],
                            },
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoriesIds',
                    foreignField: '_id',
                    as: 'categories',
                },
            },
        ];

        // Add sort stage if provided
        if (sort) {
            dataPipeline.push({ $sort: sort as Record<string, 1 | -1> });
        }

        // Add pagination
        dataPipeline.push(
            { $skip: skip },
            { $limit: limit },
        );

        // Add final project stage
        dataPipeline.push({
            $project: {
                password: 0,
                walletId: 0,
                categoriesIds: 0,
                'categories.updatedAt': 0,
                'categories.createdAt': 0,
                'categories.__v': 0,
                'categories.organizationId': 0,
                'categories.description': 0,
                'categories.parentId': 0,
            },
        });

        const pipeline: mongoose.PipelineStage[] = [
            {
                $match: matchStage,
            },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: dataPipeline as any,
                },
            },
            {
                $project: {
                    docs: '$data',
                    totalDocs: { $arrayElemAt: ['$metadata.total', 0] },
                    limit: { $literal: limit },
                    page: { $literal: page },
                },
            },
        ];

        const result = await this.userModel.aggregate(pipeline);
        const aggregationResult = result[0] || { docs: [], totalDocs: 0, limit, page };

        const totalDocs = aggregationResult.totalDocs || 0;
        const totalPages = Math.ceil(totalDocs / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            docs: aggregationResult.docs,
            totalDocs,
            limit,
            page,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null,
        };
    }



    async filterOne(
        filters: mongoose.RootFilterQuery<User>,
    ) {
        const instructorFilters: mongoose.RootFilterQuery<User> = {
            ...convertObjectValuesToObjectId(filters),
            roleName: Roles.INSTRUCTOR,
        };

        const instructor = await this.userModel
            .findOne(instructorFilters)
            .populate({
                path: 'role',
                model: Role.name,
                localField: 'roleName',
                foreignField: 'name',
            })
            .exec();

        if (!instructor) {
            throw new NotFoundException('Instructor not found');
        }

        const { password, ...instructorData } = instructor.toObject();
        return instructorData;
    }


    async update(
        filters: mongoose.RootFilterQuery<User>,
        updateData: {
            $set?: Partial<User>;
            $inc?: Partial<Record<keyof User, number>>;
            totalCourses?: number;
            totalStudents?: number;
            totalReviews?: number;
            totalEnrollments?: number;
            averageRating?: number;
        }
    ) {
        const instructor = await this.userModel.findOneAndUpdate(filters, updateData, { new: true });

        if (!instructor) {
            throw new NotFoundException('Instructor not found');
        }

        const { password, ...instructorData } = instructor.toObject();
        return instructorData;
    }
}
