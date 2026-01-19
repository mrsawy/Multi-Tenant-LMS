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
import {
    NORMALIZATION_FACTORS,
    WEIGHTS,
    CAPS,
    MINIMUM_THRESHOLDS,
    SCALING_OPTIONS,
    RECENCY_CONFIG,
} from '../config/featuredInstructors.config';

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

    async getFeatured(limit: number = 10) {
        // Extract config values as literals for MongoDB aggregation
        const {
            instructorReviews: normInstructorReviews,
            instructorStudents: normInstructorStudents,
            instructorCourses: normInstructorCourses,
            orgReviews: normOrgReviews,
            orgEnrollments: normOrgEnrollments,
            orgCourses: normOrgCourses,
            ratingScale: normRatingScale,
        } = NORMALIZATION_FACTORS;

        const {
            instructor: {
                totalCoursesReviews: weightInstructorTotalCoursesReviews,
                averageCoursesRating: weightInstructorAverageCoursesRating,
                totalStudents: weightInstructorTotalStudents,
                totalCourses: weightInstructorTotalCourses
            },
            organization: {
                totalCoursesReviews: weightOrgTotalCoursesReviews,
                averageCoursesRating: weightOrgAverageCoursesRating,
                totalEnrollments: weightOrgTotalEnrollments,
                totalCourses: weightOrgTotalCourses
            },
            recency: weightRecency,
        } = WEIGHTS;

        const {
            instructorTotalCoursesReviews: capInstructorReviews,
            instructorTotalStudents: capInstructorStudents,
            instructorTotalCourses: capInstructorCourses,
            orgTotalCoursesReviews: capOrgReviews,
            orgTotalEnrollments: capOrgEnrollments,
            orgTotalCourses: capOrgCourses,
        } = CAPS;

        const {
            totalCourses: minTotalCourses,
            totalCoursesReviews: minTotalCoursesReviews,
        } = MINIMUM_THRESHOLDS;

        const { useLogarithmicScaling } = SCALING_OPTIONS;
        const { enabled: recencyEnabled, millisecondsPerYear } = RECENCY_CONFIG;

        const pipeline: mongoose.PipelineStage[] = [
            // Match only instructors with minimum thresholds
            {
                $match: {
                    roleName: {
                        $regex: /^instructor$/i,
                    },
                    // Only include instructors with at least some activity
                    $and: [
                        { totalCourses: { $gte: minTotalCourses } },
                        { totalCoursesReviews: { $gte: minTotalCoursesReviews } },
                    ],
                },
            },
            // Lookup organization to get organization stats
            {
                $lookup: {
                    from: 'organizations',
                    localField: 'organizationId',
                    foreignField: '_id',
                    as: 'organization',
                },
            },
            {
                $unwind: {
                    path: '$organization',
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Use pre-calculated instructor stats and prepare organization stats
            {
                $addFields: {
                    // Use stored instructor metrics (with defaults if null)
                    instructorTotalCoursesReviews: { $ifNull: ['$totalCoursesReviews', 0] },
                    instructorAverageCoursesRating: { $ifNull: ['$averageCoursesRating', 0] },
                    instructorTotalStudents: { $ifNull: ['$totalStudents', 0] },
                    instructorTotalCourses: { $ifNull: ['$totalCourses', 0] },
                    // Get organization stats (with defaults if organization doesn't exist)
                    orgStats: {
                        $cond: {
                            if: { $ne: ['$organization', null] },
                            then: '$organization.stats',
                            else: {
                                totalCourses: 0,
                                totalEnrollments: 0,
                                totalCoursesReviews: 0,
                                averageCoursesRating: 0,
                            },
                        },
                    },
                    // Calculate account age in years (for recency factor)
                    accountAgeYears: {
                        $divide: [
                            {
                                $subtract: [
                                    new Date(),
                                    { $ifNull: ['$createdAt', new Date()] },
                                ],
                            },
                            millisecondsPerYear,
                        ],
                    },
                },
            },
            // Calculate featured score
            // Using a weighted formula that combines instructor and organization metrics
            {
                $addFields: {
                    featuredScore: {
                        $add: [
                            // Instructor metrics (weighted)
                            // Total courses reviews (with capping and optional logarithmic scaling)
                            {
                                $multiply: [
                                    {
                                        $min: [
                                            useLogarithmicScaling.reviews
                                                ? {
                                                    $divide: [
                                                        {
                                                            $ln: {
                                                                $add: [
                                                                    '$instructorTotalCoursesReviews',
                                                                    1,
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            $ln: {
                                                                $add: [normInstructorReviews, 1],
                                                            },
                                                        },
                                                    ],
                                                }
                                                : {
                                                    $divide: [
                                                        '$instructorTotalCoursesReviews',
                                                        normInstructorReviews,
                                                    ],
                                                },
                                            capInstructorReviews,
                                        ],
                                    },
                                    weightInstructorTotalCoursesReviews,
                                ],
                            },
                            // Average courses rating - scale 0-5 to 0-1
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            '$instructorAverageCoursesRating',
                                            normRatingScale,
                                        ],
                                    },
                                    weightInstructorAverageCoursesRating,
                                ],
                            },
                            // Total students (with logarithmic scaling and capping)
                            {
                                $multiply: [
                                    {
                                        $min: [
                                            useLogarithmicScaling.students
                                                ? {
                                                    $divide: [
                                                        {
                                                            $ln: {
                                                                $add: [
                                                                    '$instructorTotalStudents',
                                                                    1,
                                                                ],
                                                            },
                                                        },
                                                        {
                                                            $ln: {
                                                                $add: [normInstructorStudents, 1],
                                                            },
                                                        },
                                                    ],
                                                }
                                                : {
                                                    $divide: [
                                                        '$instructorTotalStudents',
                                                        normInstructorStudents,
                                                    ],
                                                },
                                            capInstructorStudents,
                                        ],
                                    },
                                    weightInstructorTotalStudents,
                                ],
                            },
                            // Total courses (with capping)
                            {
                                $multiply: [
                                    {
                                        $min: [
                                            {
                                                $divide: [
                                                    '$instructorTotalCourses',
                                                    normInstructorCourses,
                                                ],
                                            },
                                            capInstructorCourses,
                                        ],
                                    },
                                    weightInstructorTotalCourses,
                                ],
                            },
                            // Organization metrics (weighted)
                            // Organization total courses reviews (with capping)
                            {
                                $multiply: [
                                    {
                                        $min: [
                                            {
                                                $divide: [
                                                    { $ifNull: ['$orgStats.totalCoursesReviews', 0] },
                                                    normOrgReviews,
                                                ],
                                            },
                                            capOrgReviews,
                                        ],
                                    },
                                    weightOrgTotalCoursesReviews,
                                ],
                            },
                            // Organization average courses rating - scale 0-5 to 0-1
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            { $ifNull: ['$orgStats.averageCoursesRating', 0] },
                                            normRatingScale,
                                        ],
                                    },
                                    weightOrgAverageCoursesRating,
                                ],
                            },
                            // Organization total enrollments (with capping)
                            {
                                $multiply: [
                                    {
                                        $min: [
                                            {
                                                $divide: [
                                                    { $ifNull: ['$orgStats.totalEnrollments', 0] },
                                                    normOrgEnrollments,
                                                ],
                                            },
                                            capOrgEnrollments,
                                        ],
                                    },
                                    weightOrgTotalEnrollments,
                                ],
                            },
                            // Organization total courses (with capping)
                            {
                                $multiply: [
                                    {
                                        $min: [
                                            {
                                                $divide: [
                                                    { $ifNull: ['$orgStats.totalCourses', 0] },
                                                    normOrgCourses,
                                                ],
                                            },
                                            capOrgCourses,
                                        ],
                                    },
                                    weightOrgTotalCourses,
                                ],
                            },
                            // Recency factor (newer instructors get slight boost)
                            ...(recencyEnabled
                                ? [
                                    {
                                        $multiply: [
                                            '$accountAgeYears',
                                            weightRecency,
                                        ],
                                    },
                                ]
                                : []),
                        ],
                    },
                },
            },
            // Sort by featured score descending
            {
                $sort: { featuredScore: -1 },
            },
            // Limit results
            {
                $limit: limit,
            },
            // Add computed fields to root level
            {
                $addFields: {
                    totalCourses: '$instructorTotalCourses',
                    totalCoursesReviews: '$instructorTotalCoursesReviews',
                    averageCoursesRating: '$instructorAverageCoursesRating',
                    totalStudents: '$instructorTotalStudents',
                },
            },
            // Project final fields (using inclusion projection)
            {
                $project: {
                    // Include all user fields except sensitive ones
                    _id: 1,
                    organizationId: 1,
                    username: 1,
                    email: 1,
                    phone: 1,
                    firstName: 1,
                    lastName: 1,
                    roleName: 1,
                    profile: 1,
                    preferences: 1,
                    status: 1,
                    lastLogin: 1,
                    preferredCurrency: 1,
                    averageRating: 1,
                    totalReviews: 1,
                    categoriesIds: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    // Include computed instructor metrics
                    totalCourses: 1,
                    totalCoursesReviews: 1,
                    averageCoursesRating: 1,
                    totalStudents: 1,
                    featuredScore: 1,
                    // Include organization stats (clean nested structure)
                    organizationStats: {
                        totalCourses: { $ifNull: ['$orgStats.totalCourses', 0] },
                        totalEnrollments: { $ifNull: ['$orgStats.totalEnrollments', 0] },
                        totalCoursesReviews: { $ifNull: ['$orgStats.totalCoursesReviews', 0] },
                        averageCoursesRating: { $ifNull: ['$orgStats.averageCoursesRating', 0] },
                        totalReviews: { $ifNull: ['$orgStats.totalReviews', 0] },
                        averageRating: { $ifNull: ['$orgStats.averageRating', 0] },
                    },
                    // Include organization basic info
                    organization: {
                        _id: '$organization._id',
                        name: '$organization.name',
                    },
                },
            },
        ];


        const featuredInstructors = await this.userModel.aggregate(pipeline);
        return featuredInstructors;


    }
}
