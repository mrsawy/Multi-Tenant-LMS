import { Model, Types } from 'mongoose';
import { Course } from '../entities/course.entity';
import { Category } from '../../category/entities/category.entity';
import { CourseModuleEntity } from '../entities/course-module.entity';
import { CourseContent } from '../entities/course-content.entity';
import { fakerAR as faker } from '@faker-js/faker';
import { BillingCycle } from '../../utils/enums/billingCycle.enum';
import { ContentType } from '../enum/contentType.enum';
import { VideoType } from '../enum/videoType.enum';
import { User } from '../../user/entities/user.entity';

export class CourseSeeder {
  constructor(
    private readonly courseModel: Model<Course>,
    private readonly categoryModel: Model<Category>,
    private readonly moduleModel: Model<CourseModuleEntity>,
    private readonly contentModel: Model<CourseContent>,
    private readonly userModel: Model<User>,
  ) { }

  async seedCategories(organizationId: Types.ObjectId, count: number = 5) {
    const categories: any[] = [];
    for (let i = 0; i < count; i++) {
      const cat = await this.categoryModel.create({
        organizationId,
        name: faker.commerce.department() + ' ' + faker.string.alphanumeric(3),
        description: faker.lorem.sentence(),
      });
      categories.push(cat);
    }
    return categories;
  }

  async seedCourse(
    organizationId: Types.ObjectId,
    instructorId: Types.ObjectId,
    createdBy: string,
    categoryIds: Types.ObjectId[],
    overrides: Partial<Course> = {},
    contentTypes?: ContentType[],
    coInstructorsIds?: Types.ObjectId[],
  ) {
    const courseId = new Types.ObjectId();
    const isPaid = overrides.isPaid ?? faker.datatype.boolean();

    const courseName = overrides.name || faker.commerce.productName();
    const courseSlug = courseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const thumbnailExtension = faker.helpers.arrayElement(['jpg', 'png', 'webp']);
    const trailerExtension = 'mp4';

    const courseData = {
      _id: courseId,
      organizationId,
      name: courseName,
      createdBy,
      categoriesIds: categoryIds,
      isPaid,
      instructorId,
      coInstructorsIds: coInstructorsIds || [],
      description: faker.lorem.paragraphs(2),
      shortDescription: faker.lorem.sentence(),
      learningObjectives: [faker.lorem.sentence(), faker.lorem.sentence()],
      thumbnailKey: `courses/testquantcdn/testquantcdn_thumbnail.png`,
      trailerKey: `courses/trailers/--and--E4oqF/019bc9aa-75c3-7147-9e03-7e8477182028_emerging-technology-course-trailer-dordt-university.mp4`,
      pricing: isPaid ? {
        [BillingCycle.ONE_TIME]: {
          originalPrice: faker.number.int({ min: 50, max: 200 }),
          priceUSD: faker.number.int({ min: 50, max: 200 }),
          originalCurrency: 'USD',
        }
      } : undefined,
      settings: {
        isPublished: true,
        isDraft: false,
      },
      ...overrides,
    };

    const course = await this.courseModel.create(courseData);

    // Seed Modules
    const modulesCount = faker.number.int({ min: 3, max: 5 });
    const moduleIds: Types.ObjectId[] = [];
    for (let i = 0; i < modulesCount; i++) {
      const module = await this.moduleModel.create({
        courseId: course._id,
        organizationId,
        createdBy,
        title: `${faker.lorem.words(5)}`,
        description: faker.lorem.sentence(),
        learningObjectives: [
          faker.lorem.sentence(),
          faker.lorem.sentence(),
          faker.lorem.sentence(),
        ],
      });
      moduleIds.push(module._id);

      // Seed Contents
      const contentsCount = faker.number.int({ min: 2, max: 5 });
      const contentIds: Types.ObjectId[] = [];
      // Use configured content types or default to all types
      const availableTypes = contentTypes && contentTypes.length > 0
        ? contentTypes
        : [
          ContentType.VIDEO,
          ContentType.ARTICLE,
          ContentType.QUIZ,
          ContentType.ASSIGNMENT,
          ContentType.PROJECT,
          ContentType.LIVE_SESSION
        ];

      // Distribute content types across contents
      const typesToUse: ContentType[] = [];
      for (let j = 0; j < contentsCount; j++) {
        typesToUse.push(availableTypes[j % availableTypes.length]);
      }
      // Shuffle to add variety
      const shuffledTypes = [...typesToUse].sort(() => 0.5 - Math.random());

      for (let j = 0; j < contentsCount; j++) {
        const type = shuffledTypes[j];
        let contentData: any = {
          courseId: course._id,
          organizationId,
          moduleId: module._id,
          createdBy,
          type,
          title: ` ${faker.lorem.words(4)}`,
          description: faker.lorem.sentence(),
        };

        // Add type-specific fields
        switch (type) {
          case ContentType.VIDEO:
            // Randomly choose between URL (YouTube) and UPLOAD (S3)
            const videoType = faker.helpers.arrayElement([VideoType.URL, VideoType.UPLOAD]);
            contentData.videoType = videoType;
            if (videoType === VideoType.URL) {
              // Generate realistic YouTube URLs
              const youtubeVideoIds = [
                'dQw4w9WgXcQ',
                'jNQXAC9IVRw',
                'kJQP7kiw5Fk',
                '9bZkp7q19f0',
                'L_jWHffIx5E',
                'fJ9rUzIMcZQ',
                'kJQP7kiw5Fk',
              ];
              const videoId = faker.helpers.arrayElement(youtubeVideoIds);
              contentData.videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            } else {
              // S3 file key format
              contentData.fileKey = `course-materials/teach/851c7e1e-2b66-4d3b-bb6c-2f0553c4f26f.mp4`;
            }
            break;
          case ContentType.ARTICLE:
            contentData.body = faker.lorem.paragraphs(faker.number.int({ min: 3, max: 8 }));
            break;
          case ContentType.QUIZ:
            const questionsCount = faker.number.int({ min: 3, max: 8 });
            const questions = Array.from({ length: questionsCount }, () => ({
              questionText: faker.lorem.sentence() + '?',
              options: [
                faker.lorem.sentence(),
                faker.lorem.sentence(),
                faker.lorem.sentence(),
                faker.lorem.sentence(),
              ],
              correctOption: faker.number.int({ min: 0, max: 3 }),
            }));
            contentData.questions = questions;
            contentData.maxAttempts = faker.number.int({ min: 1, max: 3 });
            contentData.quizDurationInMinutes = faker.number.int({ min: 15, max: 60 });
            contentData.quizStartDate = faker.date.past();
            contentData.quizEndDate = faker.date.future();
            break;
          case ContentType.ASSIGNMENT:
            contentData.dueDate = faker.date.future();
            contentData.content = faker.lorem.paragraphs(2);
            contentData.maxPoints = faker.number.int({ min: 50, max: 100 });
            // Sometimes add a file key
            if (faker.datatype.boolean()) {
              contentData.fileKey = `courses/${course._id}/assignments/${faker.string.alphanumeric(16)}.pdf`;
            }
            break;
          case ContentType.PROJECT:
            const isGroupProject = faker.datatype.boolean();
            contentData.dueDate = faker.date.future();
            contentData.requirements = faker.lorem.paragraphs(faker.number.int({ min: 2, max: 4 }));
            contentData.maxPoints = faker.number.int({ min: 100, max: 200 });
            contentData.isGroupProject = isGroupProject;
            if (isGroupProject) {
              contentData.maxGroupSize = faker.number.int({ min: 2, max: 5 });
            }
            contentData.description = faker.lorem.paragraph();
            contentData.deliverables = Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
              faker.lorem.sentence(),
            );
            break;
          case ContentType.LIVE_SESSION:
            const startDate = faker.date.future();
            const durationMinutes = faker.number.int({ min: 30, max: 120 });
            const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
            const platforms = ['ZOOM', 'GOOGLE_MEET', 'MICROSOFT_TEAMS', 'OTHER'];
            const platform = faker.helpers.arrayElement(platforms);

            contentData.startDate = startDate;
            contentData.endDate = endDate;
            contentData.meetingUrl = faker.internet.url();
            contentData.meetingId = faker.string.alphanumeric(10);
            contentData.meetingPassword = faker.datatype.boolean() ? faker.string.alphanumeric(8) : undefined;
            contentData.platform = platform;
            contentData.durationInMinutes = durationMinutes;
            contentData.description = faker.lorem.paragraph();
            // Sometimes add recording URL
            if (faker.datatype.boolean()) {
              contentData.recordingUrl = faker.internet.url();
            }
            break;
        }

        const content = await this.contentModel.create(contentData);
        contentIds.push(content._id);
      }
      await this.moduleModel.findByIdAndUpdate(module._id, { contentsIds: contentIds });
    }

    await this.courseModel.findByIdAndUpdate(course._id, { modulesIds: moduleIds });

    // Update totalCourses for instructor and co-instructors
    await this.updateInstructorTotalCourses(instructorId, coInstructorsIds || []);

    return course;
  }

  /**
   * Updates totalCourses count for instructor and co-instructors
   * totalCourses = courses where user is main instructor OR co-instructor
   */
  private async updateInstructorTotalCourses(
    instructorId: Types.ObjectId,
    coInstructorsIds: Types.ObjectId[],
  ) {
    // Update main instructor - count courses where they are main instructor OR co-instructor
    const instructorCourses = await this.courseModel.countDocuments({
      $or: [
        { instructorId: instructorId },
        { coInstructorsIds: instructorId } // MongoDB automatically checks if array contains this value
      ]
    });
    await this.userModel.findByIdAndUpdate(
      instructorId,
      { $set: { totalCourses: instructorCourses } }
    );

    // Update co-instructors - count courses where they are main instructor OR co-instructor
    for (const coInstructorId of coInstructorsIds) {
      const coInstructorCourses = await this.courseModel.countDocuments({
        $or: [
          { instructorId: coInstructorId },
          { coInstructorsIds: coInstructorId } // MongoDB automatically checks if array contains this value
        ]
      });
      await this.userModel.findByIdAndUpdate(
        coInstructorId,
        { $set: { totalCourses: coInstructorCourses } }
      );
    }
  }

  /**
   * Recalculates totalCourses for all instructors in an organization
   * This should be called after all courses are created to ensure accuracy
   */
  async recalculateAllInstructorTotalCourses(organizationId: Types.ObjectId) {
    // Get all courses in the organization
    const courses = await this.courseModel.find({ organizationId }).select('instructorId coInstructorsIds').exec();

    // Collect all unique instructor IDs (main + co-instructors)
    const allInstructorIds = new Set<Types.ObjectId>();
    for (const course of courses) {
      if (course.instructorId) {
        allInstructorIds.add(course.instructorId);
      }
      if (course.coInstructorsIds && course.coInstructorsIds.length > 0) {
        course.coInstructorsIds.forEach(id => allInstructorIds.add(id));
      }
    }

    // Recalculate totalCourses for each instructor
    // totalCourses = courses where user is main instructor OR co-instructor
    for (const instructorId of allInstructorIds) {
      const instructorCourses = await this.courseModel.countDocuments({
        $or: [
          { instructorId: instructorId },
          { coInstructorsIds: instructorId } // MongoDB automatically checks if array contains this value
        ]
      });

      await this.userModel.findByIdAndUpdate(
        instructorId,
        { $set: { totalCourses: instructorCourses } }
      );
    }
  }
}
