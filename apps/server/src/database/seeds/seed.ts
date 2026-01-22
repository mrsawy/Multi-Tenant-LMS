import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Role } from '../../role/entities/role.entity';
import { Plan } from '../../plan/entities/plan.entity';
import { User } from '../../user/entities/user.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { Category } from '../../category/entities/category.entity';
import { Course } from '../../course/entities/course.entity';
import { CourseContent } from '../../course/entities/course-content.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Review } from '../../review/entities/review.entity';
import { Discussion } from '../../discussion/entities/discussion.entity';
import { fakerAR as faker } from '@faker-js/faker';

import { RoleSeeder } from '../../role/seeds/role.seeder';
import { PlanSeeder } from '../../plan/seeds/plan.seeder';
import { UserSeeder } from '../../user/seeds/user.seeder';
import { OrganizationSeeder } from '../../organization/seeds/organization.seeder';
import { CourseSeeder } from '../../course/seeds/course.seeder';
import { EnrollmentSeeder } from '../../enrollment/seeds/enrollment.seeder';
import { CategorySeeder } from '../../category/seeds/category.seeder';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ORGANIZATIONS_SEED, ORGANIZATIONS_CONFIG } from './seed.config';
import { Roles } from 'src/role/enum/Roles.enum';
import { ReviewSeeder } from 'src/review/seed/seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const connection = app.get<Connection>(getConnectionToken());
  console.log('Cleaning database...');
  await connection.dropDatabase();
  console.log('Database cleaned.');
  const roleModel = app.get(getModelToken(Role.name));
  const planModel = app.get(getModelToken(Plan.name));
  const userModel = app.get(getModelToken(User.name));
  const walletModel = app.get(getModelToken(Wallet.name));
  const organizationModel = app.get(getModelToken(Organization.name));
  const categoryModel = app.get(getModelToken(Category.name));
  const courseModel = app.get(getModelToken(Course.name));
  const moduleModel = app.get(getModelToken('CourseModule'));
  const contentModel = app.get(getModelToken(CourseContent.name));
  const enrollmentModel = app.get(getModelToken(Enrollment.name));
  const attendanceModel = app.get(getModelToken(Attendance.name));
  const reviewModel = app.get(getModelToken(Review.name));
  const discussionModel = app.get(getModelToken(Discussion.name));

  const roleSeeder = new RoleSeeder(roleModel);
  const planSeeder = new PlanSeeder(planModel);
  const userSeeder = new UserSeeder(userModel, walletModel);
  const orgSeeder = new OrganizationSeeder(organizationModel, enrollmentModel, reviewModel, courseModel);
  const categorySeeder = new CategorySeeder(categoryModel);
  const courseSeeder = new CourseSeeder(courseModel, categoryModel, moduleModel, contentModel, userModel);
  const enrollmentSeeder = new EnrollmentSeeder(enrollmentModel, attendanceModel, reviewModel, discussionModel, courseModel, moduleModel, contentModel, userModel);
  const reviewSeeder = new ReviewSeeder(reviewModel, courseModel, enrollmentModel, userModel, organizationModel, moduleModel, contentModel);

  console.log('Seeding Roles...');
  await roleSeeder.seed();

  console.log('Seeding Plans...');
  await planSeeder.seed();

  console.log('Seeding Global Students...');
  await userSeeder.seedMultiple(5, { roleName: Roles.STUDENT, organizationId: undefined } as any);

  console.log('Seeding Organizations and their data...');
  const plans = ['Basic Plan', 'Pro Plan', 'Enterprise Plan', 'Free Plan'];

  // Seeding Organizations & it's super admins
  for (let i = 0; i < ORGANIZATIONS_CONFIG.length; i++) {
    const organization = ORGANIZATIONS_CONFIG[i];
    console.log(`Seeding Org: ${organization.name}...`);

    const superAdmin = await userSeeder.seedUser({
      username: `superadmin${i}`,
      email: `superadmin${i}@example.com`,
      roleName: Roles.SUPER_ADMIN,
    });

    const planName = plans[i % plans.length];
    const org = await orgSeeder.seed(superAdmin._id, planName, { name: organization.name });

    superAdmin.organizationId = org._id;
    await superAdmin.save();

    // Update org name if it's different from faker name used in orgSeeder
    org.name = organization.name;
    await org.save();

    // Seed varied users for this org
    console.log(`Seeding Users for ${organization.name}...`);

    await userSeeder.seedMultiple(organization.adminsCount, {
      organizationId: org._id,
      roleName: Roles.ADMIN,
    });

    const instructors = await userSeeder.seedMultiple(organization.teachersCount, {
      organizationId: org._id,
      roleName: Roles.INSTRUCTOR,
    });

    const students = await userSeeder.seedMultiple(organization.studentsCount, {
      organizationId: org._id,
      roleName: Roles.STUDENT,
    });

    console.log(`  Seeding Categories for ${organization.name}...`);
    // Collect all unique category names from all courses in this organization
    const categoryNamesSet = new Set<string>();
    organization.courses.forEach(course => {
      if (course.categories && course.categories.length > 0) {
        course.categories.forEach(catName => categoryNamesSet.add(catName));
      }
    });

    // Seed all categories for this organization
    const categoryNames = Array.from(categoryNamesSet);
    const categoryMap = await categorySeeder.seedCategoriesMap(org._id, categoryNames);

    console.log(`  Seeding Courses for ${organization.name}...`);
    const courses: Course[] = [];

    // Track which categories each instructor teaches (for assigning categories to instructors)
    const instructorCategoryMap = new Map<string, Set<string>>();
    instructors.forEach(inst => {
      instructorCategoryMap.set(inst._id.toString(), new Set<string>());
    });

    for (const courseConfig of organization.courses) {
      const instructor: any = faker.helpers.arrayElement(instructors);

      // Randomly select 0-2 co-instructors (excluding the main instructor)
      const availableCoInstructors = instructors.filter(inst => inst._id.toString() !== instructor._id.toString());
      const coInstructorsCount = faker.number.int({ min: 0, max: Math.min(2, availableCoInstructors.length) });
      const coInstructors = faker.helpers.arrayElements(availableCoInstructors, coInstructorsCount);
      const coInstructorsIds = coInstructors.map(inst => inst._id);

      // Get category IDs for this course from config
      let courseCategoryIds: any[] = [];
      if (courseConfig.categories && courseConfig.categories.length > 0) {
        courseCategoryIds = courseConfig.categories
          .map(catName => categoryMap.get(catName)?._id)
          .filter(id => id !== undefined);
      }

      // If no categories from config, use a random one (fallback)
      if (courseCategoryIds.length === 0) {
        const allCategories = Array.from(categoryMap.values());
        if (allCategories.length > 0) {
          courseCategoryIds = [faker.helpers.arrayElement(allCategories)._id];
        }
      }

      // Track categories for instructors
      const courseCategories = courseConfig.categories;
      if (courseCategories && courseCategories.length > 0) {
        const mainInstructorCategories = instructorCategoryMap.get(instructor._id.toString());
        if (mainInstructorCategories) {
          courseCategories.forEach(catName => mainInstructorCategories.add(catName));
        }

        coInstructors.forEach(coInst => {
          const coInstructorCategories = instructorCategoryMap.get(coInst._id.toString());
          if (coInstructorCategories) {
            courseCategories.forEach(catName => coInstructorCategories.add(catName));
          }
        });
      }

      const course = await courseSeeder.seedCourse(
        org._id,
        instructor._id,
        instructor.username,
        courseCategoryIds,
        {
          name: courseConfig.name,
          isPaid: courseConfig.isPaid,
          pricing: courseConfig.pricing as any,
        },
        courseConfig.contentTypes,
        coInstructorsIds,
      );
      courses.push(course);
    }

    // Assign categories to instructors based on the courses they teach
    console.log(`  Assigning Categories to Instructors for ${organization.name}...`);
    for (const instructor of instructors) {
      const instructorCategories = instructorCategoryMap.get(instructor._id.toString());
      if (instructorCategories && instructorCategories.size > 0) {
        const categoryIds = Array.from(instructorCategories)
          .map(catName => categoryMap.get(catName)?._id)
          .filter(id => id !== undefined);

        if (categoryIds.length > 0) {
          await userModel.findByIdAndUpdate(instructor._id, {
            categoriesIds: categoryIds,
          });
        }
      }
    }

    console.log(`  Seeding Enrollments for ${organization.name}...`);
    await enrollmentSeeder.seedEnrollmentsForStudents(students, courses, org._id);

    console.log(`  Seeding Reviews for ${organization.name}...`);
    await reviewSeeder.seedCoursesReviews(courses, students, organization);

    // Update organization stats
    console.log(`  Updating organization statistics for ${organization.name}...`);
    const totalCourses = organization.totalCourses ?? courses.length;
    await orgSeeder.updateOrganizationStats(org._id, totalCourses);

    // Recalculate all instructor totalCourses to ensure accuracy
    console.log(`  Recalculating instructor statistics for ${organization.name}...`);
    await courseSeeder.recalculateAllInstructorTotalCourses(org._id);
    await reviewSeeder.recalculateAllInstructorCourseRatings(org._id);
  }

  console.log('Seeding complete!');
  await app.close();
  process.exit(0);
}

bootstrap();
