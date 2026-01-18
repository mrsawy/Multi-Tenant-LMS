import { Model, Types } from 'mongoose';
import { Enrollment } from '../entities/enrollment.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Review } from '../../review/entities/review.entity';
import { Discussion } from '../../discussion/entities/discussion.entity';
import { faker } from '@faker-js/faker';
import { AccessType } from '../enum/accessType.enum';
import { AttendanceStatus } from '../../attendance/enum/attendance-status.enum';
import { ReviewType } from '../../review/enum/reviewType.enum';
import { Course } from '../../course/entities/course.entity';
import { CourseModuleEntity } from '../../course/entities/course-module.entity';
import { CourseContent, CourseContentDocument } from '../../course/entities/course-content.entity';
import { ContentType } from '../../course/enum/contentType.enum';
import { Quiz } from 'src/course/entities/quiz.schema';
import { Question } from 'aws-sdk/clients/wellarchitected';
import { QuizQuestion } from 'src/course/entities/quizSubmission.entity';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';

export class EnrollmentSeeder {
  constructor(
    private readonly enrollmentModel: Model<Enrollment>,
    private readonly attendanceModel: Model<Attendance>,
    private readonly reviewModel: Model<Review>,
    private readonly discussionModel: Model<Discussion>,
    private readonly courseModel: Model<Course>,
    private readonly moduleModel: Model<CourseModuleEntity>,
    private readonly contentModel: Model<CourseContent>,
  ) { }

  async seedEnrollment(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    organizationId: Types.ObjectId,
    progressPercentage: number,
    subscription: SubscriptionTypeDef,
    accessType: AccessType,
  ) {
    // Fetch course with modules and contents
    const course = await this.courseModel.findById(courseId).lean();
    if (!course) {
      throw new Error(`Course ${courseId} not found`);
    }

    const modulesIds = (course as any).modulesIds || [];
    const allContents: Types.ObjectId[] = [];
    const moduleContentsMap = new Map<Types.ObjectId, Types.ObjectId[]>();

    // Fetch all modules with their contents
    for (const moduleId of modulesIds) {
      const module = await this.moduleModel.findById(moduleId).lean();
      if (module) {
        const contentsIds = (module as any).contentsIds || [];
        moduleContentsMap.set(moduleId, contentsIds);
        allContents.push(...contentsIds);
      }
    }

    const totalContents = allContents.length;
    if (totalContents === 0) {
      // No contents, create enrollment with 0 progress
      return await this.enrollmentModel.create({
        userId,
        courseId,
        organizationId,
        enrolledAt: faker.date.past(),
        accessType: accessType,
        progressPercentage: 0,
        timeSpentMinutes: 0,
        progress: {
          completedModules: [],
          completedContents: [],
          completedCourses: [],
          submittedAssignments: [],
          submittedProjects: [],
          submittedQuizzes: [],
          attendedLiveSessions: [],
        },
        subscription
      });
    }

    // Calculate how many contents to complete based on progress percentage
    const contentsToComplete = Math.round((progressPercentage / 100) * totalContents);
    const completedContentsIds = allContents.slice(0, contentsToComplete);

    const completedModules: Types.ObjectId[] = [];
    const submittedAssignments: Types.ObjectId[] = [];
    const submittedProjects: Types.ObjectId[] = [];
    const submittedQuizzes: Types.ObjectId[] = [];
    const attendedLiveSessions: Types.ObjectId[] = [];

    // Process each completed content
    for (const contentId of completedContentsIds) {
      const content = await this.contentModel.findById(contentId).lean() as unknown as CourseContentDocument;
      if (!content) continue;


      const contentType = content.type as ContentType;


      // Add submissions/attendance based on content type
      switch (contentType) {
        case ContentType.QUIZ:
          submittedQuizzes.push(contentId);
          // Add quiz submission to content
          const quizQuestions = (content as Quiz).questions || [];


          // console.log({ quizQuestions });


          if (quizQuestions.length > 0) {
            const answers = quizQuestions.map((question: QuizQuestion, questionIndex: number) => {
              const isCorrect = faker.datatype.boolean({ probability: 0.7 });
              const selectedOption = isCorrect
                ? question.correctOption
                : faker.helpers.arrayElement([0, 1, 2, 3].filter(opt => opt !== question.correctOption));

              return {
                questionIndex,
                questionText: question.questionText,
                options: question.options,
                correctOption: question.correctOption,
                selectedOption,
                isCorrect,
              };
            });

            const correctCount = answers.filter((a: any) => a.isCorrect).length;
            const score = Math.round((correctCount / quizQuestions.length) * 100);
            const maxAttempts = (content as any).maxAttempts || 1;
            const quizStartDate = (content as any).quizStartDate || new Date();
            const quizDurationInMinutes = (content as any).quizDurationInMinutes || 30;

            await this.contentModel.findOneAndUpdate(
              {
                _id: contentId,
                type: ContentType.QUIZ,
              },
              {
                $push: {
                  quizSubmissions: {
                    studentId: userId,
                    organizationId,
                    answers,
                    score,
                    attemptNumber: faker.number.int({ min: 1, max: maxAttempts }),
                    timeTakenInSeconds: faker.number.int({
                      min: Math.floor(quizDurationInMinutes * 60 * 0.3),
                      max: Math.floor(quizDurationInMinutes * 60 * 0.9),
                    }),
                    submittedAt: faker.date.between({
                      from: quizStartDate,
                      to: new Date(),
                    }),
                    feedback: faker.datatype.boolean({ probability: 0.6 }) ? faker.lorem.paragraph() : undefined,
                  },
                },
              },
              { new: true },
            );
          }
          break;

        case ContentType.PROJECT:
          submittedProjects.push(contentId);
          // Add project submission to content
          const isGroupProject = (content as any).isGroupProject || false;
          const maxGroupSize = (content as any).maxGroupSize || 1;

          const submission: any = {
            studentId: userId,
            fileUrl: `https://storage.example.com/submissions/${faker.string.alphanumeric(16)}.zip`,
            description: faker.lorem.sentence(),
          };

          if (faker.datatype.boolean()) {
            submission.repositoryUrl = `https://github.com/${faker.internet.username()}/${faker.lorem.word()}`;
          }
          if (faker.datatype.boolean()) {
            submission.liveDemoUrl = faker.internet.url();
          }
          if (faker.datatype.boolean()) {
            submission.score = faker.number.int({ min: 60, max: 100 });
            submission.feedback = faker.lorem.paragraph();
          }

          await this.contentModel.findOneAndUpdate(
            {
              _id: contentId,
              type: ContentType.PROJECT,
            },
            {
              $push: { submissions: submission },
            },
            { new: true },
          );
          break;

        case ContentType.ASSIGNMENT:
          submittedAssignments.push(contentId);
          // Note: Assignment submissions are typically stored separately, but we track in progress
          break;

        case ContentType.LIVE_SESSION:
          attendedLiveSessions.push(contentId);
          // Add attendance to live session
          const startDate = (content as any).startDate || new Date();
          const durationMinutes = (content as any).durationInMinutes || 60;
          const joinedAt = new Date(startDate.getTime() + faker.number.int({ min: 0, max: 10 }) * 60000);
          const leftAt = faker.datatype.boolean()
            ? new Date(joinedAt.getTime() + faker.number.int({ min: 10, max: durationMinutes }) * 60000)
            : undefined;
          const duration = leftAt ? Math.round((leftAt.getTime() - joinedAt.getTime()) / 60000) : undefined;

          await this.contentModel.findOneAndUpdate(
            {
              _id: contentId,
              type: ContentType.LIVE_SESSION,
            },
            {
              $push: {
                attendance: {
                  studentId: userId,
                  joinedAt,
                  leftAt,
                  durationInMinutes: duration,
                  wasPresent: faker.datatype.boolean({ probability: 0.8 }),
                  notes: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
                },
              },
            },
            { new: true },
          );
          break;
      }
    }

    // Check which modules are fully completed
    for (const [moduleId, contentsIds] of moduleContentsMap.entries()) {
      const moduleContents = contentsIds.filter(id => completedContentsIds.includes(id));
      if (moduleContents.length === contentsIds.length && contentsIds.length > 0) {
        completedModules.push(moduleId);
      }
    }

    // Calculate actual progress percentage
    const actualProgressPercentage = totalContents > 0
      ? Math.round((completedContentsIds.length / totalContents) * 100)
      : 0;

    const completedCourses = completedModules.length === modulesIds.length && modulesIds.length > 0
      ? [courseId]
      : [];

    const enrollment = await this.enrollmentModel.create({
      userId,
      courseId,
      organizationId,
      enrolledAt: faker.date.past(),
      accessType: accessType,
      progressPercentage: actualProgressPercentage,
      timeSpentMinutes: faker.number.int({ min: 10, max: 500 }),
      progress: {
        completedModules,
        completedContents: completedContentsIds,
        completedCourses,
        submittedAssignments,
        submittedProjects,
        submittedQuizzes,
        attendedLiveSessions,
      },
      subscription
    });

    // Seed Attendance records for this enrollment
    const attendanceCount = faker.number.int({ min: 1, max: 5 });
    for (let i = 0; i < attendanceCount; i++) {
      await this.attendanceModel.create({
        date: faker.date.recent(),
        courseId,
        studentId: userId,
        organizationId,
        status: faker.helpers.arrayElement(Object.values(AttendanceStatus)),
        notes: faker.lorem.sentence(),
        markedBy: new Types.ObjectId(), // Just a dummy ID for markedBy
      });
    }

    // Seed Review if progress is high enough
    if (enrollment.progressPercentage > 50) {
      await this.reviewModel.create({
        userId,
        reviewType: ReviewType.COURSE,
        rating: faker.number.int({ min: 3, max: 5 }),
        comment: faker.lorem.sentence(),
        isActive: true,
        courseId, // Discriminator field
      } as any);
    }

    const discussionCount = faker.number.int({ min: 0, max: 3 });
    for (let i = 0; i < discussionCount; i++) {
      await this.discussionModel.create({
        type: 'CourseDiscussion',
        userId,
        content: faker.lorem.sentence(),
        courseId, // Discriminator field
      } as any);
    }

    return enrollment;
  }
}
