import { Model, Types } from 'mongoose';
import { Enrollment } from '../entities/enrollment.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Review } from '../../review/entities/review.entity';
import { Discussion } from '../../discussion/entities/discussion.entity';
import { fakerAR as faker } from '@faker-js/faker';
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
import { User } from '../../user/entities/user.entity';
import { SubscriptionStatus } from 'src/utils/enums/subscriptionStatus.enum';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { Currency } from 'src/payment/enums/currency.enum';
import { ENROLLMENT_CONFIG } from './enrollment.config';

export class EnrollmentSeeder {
  constructor(
    private readonly enrollmentModel: Model<Enrollment>,
    private readonly attendanceModel: Model<Attendance>,
    private readonly reviewModel: Model<Review>,
    private readonly discussionModel: Model<Discussion>,
    private readonly courseModel: Model<Course>,
    private readonly moduleModel: Model<CourseModuleEntity>,
    private readonly contentModel: Model<CourseContent>,
    private readonly userModel: Model<User>,
  ) { }

  async seedEnrollment(
    userId: Types.ObjectId,
    courseId: Types.ObjectId,
    organizationId: Types.ObjectId,
    progressPercentage: number,
    subscription: SubscriptionTypeDef,
    accessType: AccessType,
  ) {
    try {
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
        const enrollmentData: any = {
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
        };

        // Only add subscription if accessType is not FREE
        if (accessType !== AccessType.FREE && subscription) {
          enrollmentData.subscription = subscription;
        } else if (subscription) {
          // For FREE courses, subscription is optional but we can still include it
          enrollmentData.subscription = subscription;
        }

        const enrollment = await this.enrollmentModel.create(enrollmentData);

        // Update course stats.totalEnrollments
        await this.courseModel.updateOne(
          { _id: courseId },
          { $inc: { 'stats.totalEnrollments': 1 } },
        );

        // Update instructor and co-instructors totalStudents
        await this.updateInstructorTotalStudents(course);

        return enrollment;
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

      // Only include subscription if accessType requires it
      const enrollmentData: any = {
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
      };

      // Only add subscription if accessType is not FREE
      if (accessType !== AccessType.FREE && subscription) {
        enrollmentData.subscription = subscription;
      } else if (subscription) {
        // For FREE courses, subscription is optional but we can still include it
        enrollmentData.subscription = subscription;
      }

      const enrollment = await this.enrollmentModel.create(enrollmentData);

      // Update course stats.totalEnrollments
      await this.courseModel.updateOne(
        { _id: courseId },
        { $inc: { 'stats.totalEnrollments': 1 } },
      );

      // Update instructor and co-instructors totalStudents
      await this.updateInstructorTotalStudents(course);

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
    } catch (error: any) {
      console.error(`  ✗ Error in seedEnrollment for userId ${userId}, courseId ${courseId}:`, error.message);
      if (error.errors) {
        console.error(`  Validation errors:`, JSON.stringify(error.errors, null, 2));
      }
      throw error; // Re-throw to be caught by the caller
    }
  }

  /**
   * Seed enrollments for all students in an organization
   */
  async seedEnrollmentsForStudents(
    students: User[],
    courses: Course[],
    organizationId: Types.ObjectId,
  ) {
    console.log(`  Starting enrollment seeding: ${students.length} students, ${courses.length} courses`);
    console.log(`  Organization ID: ${organizationId}`);

    if (students.length === 0) {
      console.log(`  ✗ No students available, skipping enrollments...`);
      return;
    }

    if (courses.length === 0) {
      console.log(`  ✗ No courses available, skipping enrollments...`);
      return;
    }

    // Log first few students and courses for debugging
    console.log(`  Students sample:`, students.slice(0, 3).map(s => ({ id: s._id, username: s.username, role: s.roleName })));
    console.log(`  Courses sample:`, courses.slice(0, 3).map(c => ({ id: c._id, name: c.name, isPaid: c.isPaid })));

    let enrollmentConfigIndex = 0;
    let totalEnrollmentsCreated = 0;

    for (const student of students) {
      // Check existing enrollments for this student to avoid duplicates
      const existingEnrollments = await this.enrollmentModel.find({
        userId: student._id,
        organizationId: organizationId,
      }).select('courseId').lean();

      const enrolledCourseIds = new Set(
        existingEnrollments.map(e => e.courseId.toString())
      );

      // Filter out courses the student is already enrolled in
      const availableCourses = courses.filter(
        course => !enrolledCourseIds.has(course._id.toString())
      );

      if (availableCourses.length === 0) {
        console.log(`  Student ${student.username} already enrolled in all courses, skipping...`);
        continue;
      }

      // Every student gets at least 1 enrollment, up to 3 or number of available courses
      const maxEnrollments = Math.min(availableCourses.length, 3);
      const enrollmentCount = faker.number.int({ min: 1, max: maxEnrollments });
      const shuffledCourses = [...availableCourses].sort(() => 0.5 - Math.random());

      for (let k = 0; k < enrollmentCount; k++) {
        const progressConfig = ENROLLMENT_CONFIG.enrollments[enrollmentConfigIndex % ENROLLMENT_CONFIG.enrollments.length];
        const course = shuffledCourses[k];

        if (!course) {
          console.log(`  No more courses available for student ${student.username}, stopping...`);
          break;
        }

        let subscription: SubscriptionTypeDef | undefined;
        let accessType: AccessType = AccessType.FREE;

        if (course.isPaid && course.pricing) {
          const billingCycle = faker.helpers.arrayElement(Object.values(BillingCycle));
          const pricingDetails = course.pricing[billingCycle];
          if (pricingDetails) {
            subscription = {
              status: SubscriptionStatus.ACTIVE,
              starts_at: new Date(),
              next_billing: new Date(),
              reminder_days: 10,
              reminder_date: new Date(),
              ends_at: new Date(),
              resumed_at: new Date(),
              billing: {
                email: student.email,
                last_name: student.lastName,
                first_name: student.firstName,
                phone_number: student.phone,
                amount: pricingDetails.originalPrice ?? 0,
                currency: pricingDetails.originalCurrency ?? Currency.EGP,
                billingCycle: billingCycle,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            accessType = AccessType.SUBSCRIPTION;
          }
        } else {
          subscription = {
            status: SubscriptionStatus.ACTIVE,
            starts_at: new Date(),
            next_billing: new Date(),
            reminder_days: 10,
            reminder_date: new Date(),
            ends_at: new Date(),
            resumed_at: new Date(),
            billing: {
              email: student.email,
              last_name: student.lastName,
              first_name: student.firstName,
              phone_number: student.phone,
              amount: 0,
              currency: Currency.USD,
              billingCycle: BillingCycle.ONE_TIME,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        try {
          // Double-check enrollment doesn't exist (race condition protection)
          const existingEnrollment = await this.enrollmentModel.findOne({
            userId: student._id,
            courseId: course._id,
          });

          if (existingEnrollment) {
            console.log(`  Enrollment already exists for student ${student.username} in course ${course.name}, skipping...`);
            enrollmentConfigIndex++;
            continue;
          }

          console.log(`  Creating enrollment for student ${student.username} (${student._id}) in course ${course.name} (${course._id})`);

          const enrollment = await this.seedEnrollment(
            student._id,
            course._id,
            organizationId,
            progressConfig.progressPercentage,
            subscription || {
              status: SubscriptionStatus.ACTIVE,
              starts_at: new Date(),
              next_billing: new Date(),
              reminder_days: 10,
              reminder_date: new Date(),
              ends_at: new Date(),
              resumed_at: new Date(),
              billing: {
                email: student.email,
                last_name: student.lastName,
                first_name: student.firstName,
                phone_number: student.phone,
                amount: 0,
                currency: Currency.EGP,
                billingCycle: BillingCycle.ONE_TIME,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            accessType,
          );

          if (enrollment) {
            console.log(`  ✓ Successfully created enrollment ${enrollment._id} for student ${student.username} in course ${course.name}`);
            totalEnrollmentsCreated++;
          } else {
            console.log(`  ✗ Enrollment creation returned null for student ${student.username} in course ${course.name}`);
          }
          enrollmentConfigIndex++;
        } catch (error: any) {
          // Handle duplicate key errors or other errors gracefully
          if (error.code === 11000 || error.message?.includes('duplicate key')) {
            console.log(`  Duplicate enrollment detected for student ${student.username} in course ${course.name}, skipping...`);
          } else {
            console.error(`  ✗ ERROR seeding enrollment for student ${student.username} in course ${course.name}:`, error.message);
            console.error(`  Error stack:`, error.stack);
            if (error.errors) {
              console.error(`  Validation errors:`, JSON.stringify(error.errors, null, 2));
            }
          }
          enrollmentConfigIndex++;
        }
      }
    }

    console.log(`  Enrollment seeding complete: ${totalEnrollmentsCreated} enrollments created`);
  }

  /**
   * Updates instructor totalStudents count for all instructors associated with a course
   */
  private async updateInstructorTotalStudents(course: Course) {
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

    // Get total enrollments for this course
    const totalEnrollments = await this.enrollmentModel.countDocuments({
      courseId: course._id,
    });

    // Update each instructor's totalStudents
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
        continue;
      }

      // Count total unique students across all courses taught by this instructor
      const uniqueStudents = await this.enrollmentModel.distinct('userId', {
        courseId: { $in: courseIds },
      });

      const totalStudents = uniqueStudents.length;

      // Update the instructor's totalStudents
      await this.userModel.findByIdAndUpdate(
        instructorId,
        {
          $set: {
            totalStudents: totalStudents,
          },
        }
      );
    }
  }
}
