import { Model, Types } from 'mongoose';
import { Review } from '../entities/review.entity';
import { ReviewType } from '../enum/reviewType.enum';
import { fakerAR as faker } from '@faker-js/faker';
import { Course } from '../../course/entities/course.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { User } from '../../user/entities/user.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { CourseModuleEntity } from '../../course/entities/course-module.entity';
import { CourseContent } from '../../course/entities/course-content.entity';
import { ORGANIZATIONS_CONFIG } from 'src/database/seeds/seed.config';


export class ReviewSeeder {
    constructor(
        private readonly reviewModel: Model<Review>,
        private readonly courseModel: Model<Course>,
        private readonly enrollmentModel: Model<Enrollment>,
        private readonly userModel: Model<User>,
        private readonly organizationModel: Model<Organization>,
        private readonly moduleModel: Model<CourseModuleEntity>,
        private readonly contentModel: Model<CourseContent>,
    ) { }

    /**
     * Seed a course review
     */
    async seedCourseReview(
        userId: Types.ObjectId,
        courseId: Types.ObjectId,
        overrides: Partial<any> = {},
    ) {
        // Find enrollment if exists
        const enrollment = await this.enrollmentModel.findOne({
            userId,
            courseId,
        });
        if (!enrollment) {
            // Don't create review if student is not enrolled
            // This is expected behavior - reviews should only be created for enrolled students
            return null;
        }
        const existingReview = await this.reviewModel.findOne({
            userId,
            courseId,
        });
        if (existingReview) {
            return existingReview;
        }

        const rating = overrides.rating ?? faker.number.int({ min: 1, max: 5 });

        const reviewData: any = {
            userId,
            reviewType: ReviewType.COURSE,
            rating,
            comment: overrides.comment ?? (faker.datatype.boolean({ probability: 0.7 }) ? faker.lorem.paragraph() : undefined),
            isActive: overrides.isActive ?? true,
            courseId,
            enrollmentId: enrollment?._id,
            isEnrolled: !!enrollment,
            contentQuality: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 1, max: 5 }) : undefined,
            instructorQuality: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 1, max: 5 }) : undefined,
            valueForMoney: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 1, max: 5 }) : undefined,
            ...overrides,
        };

        const review = await this.reviewModel.create(reviewData);

        // Update course stats.totalReviews and stats.averageRating
        const course = await this.courseModel.findById(courseId);
        if (course) {
            const currentTotalReviews = course.stats?.totalReviews || 0;
            const currentAverageRating = course.stats?.averageRating || 0;

            const newTotalReviews = currentTotalReviews + 1;
            const newAverageRating = currentTotalReviews === 0
                ? rating
                : (currentAverageRating * currentTotalReviews + rating) / newTotalReviews;

            await this.courseModel.findByIdAndUpdate(courseId, {
                $set: {
                    'stats.totalReviews': newTotalReviews,
                    'stats.averageRating': Math.round(newAverageRating * 10) / 10, // Round to 1 decimal place
                },
            });
        }

        return review;
    }


    async seedCoursesReviews(
        courses: Course[],
        users: User[],
        organizationConfig?: any,
    ) {
        console.log(`  Starting review seeding: ${courses.length} courses, ${users.length} users`);
        
        // Get students from users array
        const students = users.filter(user => user.roleName === 'STUDENT');

        if (students.length === 0) {
            console.log('  No students available for seeding reviews');
            return;
        }

        if (courses.length === 0) {
            console.log('  No courses available for seeding reviews');
            return;
        }

        let totalReviewsCreated = 0;
        const unUsedUsers = [...students];

        // If organizationConfig is provided, use it; otherwise iterate through all organizations
        const organizationsToProcess = organizationConfig 
            ? [{ courses: organizationConfig.courses }]
            : ORGANIZATIONS_CONFIG;

        // Iterate through courses and seed reviews based on config
        for (const organization of organizationsToProcess) {
            for (const courseConfig of organization.courses) {
                const course = courses.find(c => c.name === courseConfig.name);
                if (course && courseConfig.reviews) {
                    console.log(`  Seeding reviews for course: ${course.name} (${courseConfig.reviews.length} reviews)`);
                    for (const reviewConfig of courseConfig.reviews) {
                        if (unUsedUsers.length === 0) {
                            console.log('  No more unused students available for reviews, reusing students...');
                            // Reset unused users if we run out
                            unUsedUsers.push(...students);
                        }
                        const user = faker.helpers.arrayElement(unUsedUsers);
                        const userIndex = unUsedUsers.indexOf(user);
                        if (userIndex > -1) {
                            unUsedUsers.splice(userIndex, 1);
                        }
                        // Correct parameter order: userId, courseId, overrides
                        const review = await this.seedCourseReview(user._id, course._id, {
                            rating: reviewConfig.rating,
                            comment: reviewConfig.comment,
                        });
                        if (review) {
                            totalReviewsCreated++;
                        }
                    }
                } else if (courseConfig.reviews && !course) {
                    console.log(`  Warning: Course "${courseConfig.name}" not found in courses array`);
                }
            }
        }
        
        console.log(`  Review seeding complete: ${totalReviewsCreated} reviews created`);
    }

    /**
     * Seed an instructor review
     */
    async seedInstructorReview(
        userId: Types.ObjectId,
        instructorId: Types.ObjectId,
        organizationId: Types.ObjectId,
        courseId?: Types.ObjectId,
        overrides: Partial<any> = {},
    ) {
        const reviewData: any = {
            userId,
            reviewType: ReviewType.INSTRUCTOR,
            rating: overrides.rating ?? faker.number.int({ min: 1, max: 5 }),
            comment: overrides.comment ?? (faker.datatype.boolean({ probability: 0.7 }) ? faker.lorem.paragraph() : undefined),
            isActive: overrides.isActive ?? true,
            instructorId,
            courseId: courseId ?? (faker.datatype.boolean({ probability: 0.5 }) ? await this.getRandomCourseId(organizationId) : undefined),
            teachingQuality: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 1, max: 5 }) : undefined,
            communication: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 1, max: 5 }) : undefined,
            responsiveness: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 1, max: 5 }) : undefined,
            knowledgeLevel: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 1, max: 5 }) : undefined,
            ...overrides,
        };

        return await this.reviewModel.create(reviewData);
    }

    /**
     * Seed an organization review
     */
    async seedOrganizationReview(
        userId: Types.ObjectId,
        organizationId: Types.ObjectId,
        overrides: Partial<any> = {},
    ) {
        const reviewData: any = {
            userId,
            reviewType: ReviewType.ORGANIZATION,
            rating: overrides.rating ?? faker.number.int({ min: 1, max: 5 }),
            comment: overrides.comment ?? (faker.datatype.boolean({ probability: 0.7 }) ? faker.lorem.paragraph() : undefined),
            isActive: overrides.isActive ?? true,
            reviewedOrganizationId: organizationId,
            coursesQuality: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 1, max: 5 }) : undefined,
            platformExperience: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 1, max: 5 }) : undefined,
            support: faker.datatype.boolean({ probability: 0.6 }) ? faker.number.int({ min: 1, max: 5 }) : undefined,
            ...overrides,
        };

        return await this.reviewModel.create(reviewData);
    }

    /**
     * Seed a module review
     */
    async seedModuleReview(
        userId: Types.ObjectId,
        moduleId: Types.ObjectId,
        organizationId: Types.ObjectId,
        courseId?: Types.ObjectId,
        overrides: Partial<any> = {},
    ) {
        // Find enrollment if exists
        let enrollment;
        if (courseId) {
            enrollment = await this.enrollmentModel.findOne({
                userId,
                courseId,
                organizationId,
            });
        }

        const reviewData: any = {
            userId,
            reviewType: ReviewType.MODULE,
            rating: overrides.rating ?? faker.number.int({ min: 1, max: 5 }),
            comment: overrides.comment ?? (faker.datatype.boolean({ probability: 0.7 }) ? faker.lorem.sentence() : undefined),
            isActive: overrides.isActive ?? true,
            moduleId,
            enrollmentId: enrollment?._id,
            isEnrolled: !!enrollment,
            ...overrides,
        };

        return await this.reviewModel.create(reviewData);
    }

    /**
     * Seed a content review
     */
    async seedContentReview(
        userId: Types.ObjectId,
        contentId: Types.ObjectId,
        organizationId: Types.ObjectId,
        courseId?: Types.ObjectId,
        overrides: Partial<any> = {},
    ) {
        // Find enrollment if exists
        let enrollment;
        if (courseId) {
            enrollment = await this.enrollmentModel.findOne({
                userId,
                courseId,
                organizationId,
            });
        }

        const reviewData: any = {
            userId,
            reviewType: ReviewType.CONTENT,
            rating: overrides.rating ?? faker.number.int({ min: 1, max: 5 }),
            comment: overrides.comment ?? (faker.datatype.boolean({ probability: 0.7 }) ? faker.lorem.sentence() : undefined),
            isActive: overrides.isActive ?? true,
            contentId,
            enrollmentId: enrollment?._id,
            isEnrolled: !!enrollment,
            ...overrides,
        };

        return await this.reviewModel.create(reviewData);
    }

    /**
     * Seed multiple reviews for a course
     */
    async seedCourseReviews(
        courseId: Types.ObjectId,
        organizationId: Types.ObjectId,
        count: number = 5,
    ) {
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new Error(`Course ${courseId} not found`);
        }

        // Get enrolled students for this course
        const enrollments = await this.enrollmentModel.find({
            courseId,
            organizationId,
        }).limit(count);

        const reviews: Review[] = [];
        for (const enrollment of enrollments) {
            const review = await this.seedCourseReview(
                enrollment.userId,
                courseId,
                {
                    rating: enrollment.progressPercentage > 80
                        ? faker.number.int({ min: 4, max: 5 })
                        : faker.number.int({ min: 1, max: 5 }),
                },
            );
            if (review) {
                reviews.push(review);
            }
        }

        return reviews;
    }

    /**
     * Seed multiple reviews for an instructor
     */
    async seedInstructorReviews(
        instructorId: Types.ObjectId,
        organizationId: Types.ObjectId,
        count: number = 5,
    ) {
        // Get courses taught by this instructor
        const courses = await this.courseModel.find({
            instructorId,
            organizationId,
        }).limit(count);

        if (courses.length === 0) {
            return [];
        }

        const reviews: Review[] = [];
        for (const course of courses) {
            // Get students enrolled in this course
            const enrollments = await this.enrollmentModel.find({
                courseId: course._id,
                organizationId,
            }).limit(1);

            if (enrollments.length > 0) {
                const enrollment = enrollments[0];
                if (enrollment.progressPercentage > 30) {
                    const review = await this.seedInstructorReview(
                        enrollment.userId,
                        instructorId,
                        organizationId,
                        course._id,
                    );
                    reviews.push(review);
                }
            }
        }

        return reviews;
    }

    /**
     * Seed multiple reviews for an organization
     */
    async seedOrganizationReviews(
        organizationId: Types.ObjectId,
        count: number = 10,
    ) {
        // Get users associated with this organization
        const users = await this.userModel.find({
            organizationId,
        }).limit(count);

        const reviews: Review[] = [];
        for (const user of users) {
            // Only students can review organizations
            if (user.roleName === 'STUDENT') {
                const review = await this.seedOrganizationReview(
                    user._id,
                    organizationId,
                );
                reviews.push(review);
            }
        }

        return reviews;
    }

    /**
     * Seed reviews for modules in a course
     */
    async seedModuleReviews(
        courseId: Types.ObjectId,
        organizationId: Types.ObjectId,
        count: number = 3,
    ) {
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new Error(`Course ${courseId} not found`);
        }

        const modulesIds = (course as any).modulesIds || [];
        if (modulesIds.length === 0) {
            return [];
        }

        const reviews: Review[] = [];
        // Get enrolled students
        const enrollments = await this.enrollmentModel.find({
            courseId,
            organizationId,
        }).limit(count);

        for (const enrollment of enrollments) {
            // Pick random modules
            const selectedModules = faker.helpers.arrayElements(modulesIds, {
                min: 1,
                max: Math.min(modulesIds.length, 2),
            });

            for (const moduleId of selectedModules) {
                if (enrollment.progressPercentage > 30) {
                    const review = await this.seedModuleReview(
                        enrollment.userId,
                        moduleId as Types.ObjectId,
                        organizationId,
                        courseId,
                    );
                    reviews.push(review);
                }
            }
        }

        return reviews;
    }

    /**
     * Seed reviews for content items in a course
     */
    async seedContentReviews(
        courseId: Types.ObjectId,
        organizationId: Types.ObjectId,
        count: number = 5,
    ) {
        const course = await this.courseModel.findById(courseId);
        if (!course) {
            throw new Error(`Course ${courseId} not found`);
        }

        const modulesIds = (course as any).modulesIds || [];
        if (modulesIds.length === 0) {
            return [];
        }

        // Get all content IDs from modules
        const allContentIds: Types.ObjectId[] = [];
        for (const moduleId of modulesIds) {
            const module = await this.moduleModel.findById(moduleId);
            if (module) {
                const contentsIds = (module as any).contentsIds || [];
                allContentIds.push(...contentsIds);
            }
        }

        if (allContentIds.length === 0) {
            return [];
        }

        const reviews: Review[] = [];
        // Get enrolled students
        const enrollments = await this.enrollmentModel.find({
            courseId,
            organizationId,
        }).limit(count);

        for (const enrollment of enrollments) {
            // Pick random content items
            const selectedContents = faker.helpers.arrayElements(allContentIds, {
                min: 1,
                max: Math.min(allContentIds.length, 3),
            });

            for (const contentId of selectedContents) {
                if (enrollment.progressPercentage > 20) {
                    const review = await this.seedContentReview(
                        enrollment.userId,
                        contentId as Types.ObjectId,
                        organizationId,
                        courseId,
                    );
                    reviews.push(review);
                }
            }
        }

        return reviews;
    }

    /**
     * Helper method to get a random course ID from an organization
     */
    private async getRandomCourseId(organizationId: Types.ObjectId): Promise<Types.ObjectId | undefined> {
        const courses = await this.courseModel.find({ organizationId }).limit(10);
        if (courses.length === 0) {
            return undefined;
        }
        const course = faker.helpers.arrayElement(courses);
        return course._id as Types.ObjectId;
    }

    /**
     * Updates instructor course ratings (totalCoursesReviews and averageCoursesRating) 
     * for all instructors associated with a course (instructorId + coInstructorsIds)
     */
    private async updateInstructorCourseRatings(course: Course) {
        // Collect all instructor IDs (main instructor + co-instructors)
        const instructorIds: Types.ObjectId[] = [];
        if (course.instructorId) {
            instructorIds.push(course.instructorId);
        }
        if (course.coInstructorsIds && course.coInstructorsIds.length > 0) {
            instructorIds.push(...course.coInstructorsIds);
        }

        if (instructorIds.length === 0) {
            return;
        }

        // For each instructor, calculate their course ratings
        for (const instructorId of instructorIds) {
            // Get all courses taught by this instructor
            const instructorCourses = await this.courseModel.find({
                $or: [
                    { instructorId: instructorId },
                    { coInstructorsIds: instructorId }
                ]
            }).select('_id').exec();

            const courseIds = instructorCourses.map(c => c._id);

            if (courseIds.length === 0) {
                // No courses, set to 0
                await this.userModel.findByIdAndUpdate(
                    instructorId,
                    {
                        $set: {
                            totalCoursesReviews: 0,
                            averageCoursesRating: 0,
                        },
                    }
                );
                continue;
            }

            // Get all active course reviews for all courses taught by this instructor
            const allCourseReviews = await this.reviewModel.find({
                reviewType: ReviewType.COURSE,
                courseId: { $in: courseIds },
                isActive: true,
            });

            // Calculate total reviews and average rating
            const totalCoursesReviews = allCourseReviews.length;
            const averageCoursesRating = totalCoursesReviews > 0
                ? Math.round((allCourseReviews.reduce((sum, review) => sum + review.rating, 0) / totalCoursesReviews) * 10) / 10
                : 0;

            // Update the instructor's course ratings
            await this.userModel.findByIdAndUpdate(
                instructorId,
                {
                    $set: {
                        totalCoursesReviews: totalCoursesReviews,
                        averageCoursesRating: averageCoursesRating,
                    },
                }
            );
        }
    }



    /**
    * Recalculates totalCoursesReviews and averageCoursesRating for all instructors in an organization
    * This should be called after all course reviews are seeded to ensure accuracy
    */
    async recalculateAllInstructorCourseRatings(organizationId: Types.ObjectId) {
        // Get all courses in the organization
        const courses = await this.courseModel.find({ organizationId }).select('instructorId coInstructorsIds').exec();

        // Collect all unique instructor IDs (main + co-instructors)
        // Use string representation to ensure proper uniqueness
        const allInstructorIdsSet = new Set<string>();
        const instructorIdMap = new Map<string, Types.ObjectId>();

        for (const course of courses) {
            if (course.instructorId) {
                const idStr = course.instructorId.toString();
                allInstructorIdsSet.add(idStr);
                instructorIdMap.set(idStr, course.instructorId);
            }
            if (course.coInstructorsIds && course.coInstructorsIds.length > 0) {
                course.coInstructorsIds.forEach(id => {
                    const idStr = id.toString();
                    allInstructorIdsSet.add(idStr);
                    instructorIdMap.set(idStr, id);
                });
            }
        }

        // Recalculate course ratings for each instructor using aggregation for accuracy
        for (const instructorIdStr of allInstructorIdsSet) {
            const instructorId = instructorIdMap.get(instructorIdStr)!;

            // Use aggregation to directly count reviews for courses this instructor teaches
            // This ensures we only count reviews from courses in the correct organization
            const result = await this.reviewModel.aggregate([
                // Match only course reviews that are active
                {
                    $match: {
                        reviewType: ReviewType.COURSE,
                        isActive: true,
                    }
                },
                // Lookup the course to verify it belongs to this instructor and organization
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'courseId',
                        foreignField: '_id',
                        as: 'course',
                    }
                },
                // Unwind course array (should be single course)
                {
                    $unwind: {
                        path: '$course',
                        preserveNullAndEmptyArrays: false
                    }
                },
                // Match courses that:
                // 1. Belong to the correct organization
                // 2. Are taught by this instructor (as main or co-instructor)
                {
                    $match: {
                        'course.organizationId': organizationId,
                        $or: [
                            { 'course.instructorId': instructorId },
                            { 'course.coInstructorsIds': instructorId }
                        ]
                    }
                },
                // Group to calculate totals and average
                {
                    $group: {
                        _id: null,
                        totalReviews: { $sum: 1 },
                        totalRating: { $sum: '$rating' },
                    }
                }
            ]);

            // Extract results
            const totalCoursesReviews = result.length > 0 ? result[0].totalReviews : 0;
            const averageCoursesRating = result.length > 0 && totalCoursesReviews > 0
                ? Math.round((result[0].totalRating / totalCoursesReviews) * 10) / 10
                : 0;

            // Update the instructor's course ratings
            await this.userModel.findByIdAndUpdate(
                instructorId,
                {
                    $set: {
                        totalCoursesReviews: totalCoursesReviews,
                        averageCoursesRating: averageCoursesRating,
                    },
                }
            );
        }
    }
}
