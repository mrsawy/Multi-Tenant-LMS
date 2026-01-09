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
import { CourseModuleEntity } from '../../course/entities/course-module.entity';
import { CourseContent } from '../../course/entities/course-content.entity';
import { Enrollment } from '../../enrollment/entities/enrollment.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { Review } from '../../review/entities/review.entity';
import { Discussion } from '../../discussion/entities/discussion.entity';
import { faker } from '@faker-js/faker';

import { RoleSeeder } from '../../role/seeds/role.seeder';
import { PlanSeeder } from '../../plan/seeds/plan.seeder';
import { UserSeeder } from '../../user/seeds/user.seeder';
import { OrganizationSeeder } from '../../organization/seeds/organization.seeder';
import { CourseSeeder } from '../../course/seeds/course.seeder';
import { EnrollmentSeeder } from '../../enrollment/seeds/enrollment.seeder';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { ORGANIZATIONS_SEED, ORGANIZATIONS_CONFIG } from '../../organization/seeds/seed.config';
import { ENROLLMENT_CONFIG } from '../../enrollment/seeds/enrollment.config';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';
import { SubscriptionStatus } from 'src/utils/enums/subscriptionStatus.enum';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { Currency } from 'src/payment/enums/currency.enum';
import { AccessType } from 'src/enrollment/enum/accessType.enum';

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
  const orgSeeder = new OrganizationSeeder(organizationModel);
  const courseSeeder = new CourseSeeder(courseModel, categoryModel, moduleModel, contentModel);
  const enrollmentSeeder = new EnrollmentSeeder(enrollmentModel, attendanceModel, reviewModel, discussionModel, courseModel, moduleModel, contentModel);

  console.log('Seeding Roles...');
  await roleSeeder.seed();

  console.log('Seeding Plans...');
  await planSeeder.seed();

  console.log('Seeding Global Students...');
  await userSeeder.seedMultiple(5, { roleName: 'Student', organizationId: undefined } as any);

  console.log('Seeding Organizations and their data...');
  const plans = ['Basic Plan', 'Pro Plan', 'Enterprise Plan', 'Free Plan'];

  // Seeding Organizations & it's super admins
  for (let i = 0; i < ORGANIZATIONS_CONFIG.length; i++) {
    const organization = ORGANIZATIONS_CONFIG[i];
    console.log(`Seeding Org: ${organization.name}...`);

    const superAdmin = await userSeeder.seedUser({
      username: `superadmin${i}`,
      email: `superadmin${i}@example.com`,
      roleName: 'SuperAdmin',
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
      roleName: 'Admin',
    });

    const instructors = await userSeeder.seedMultiple(organization.teachersCount, {
      organizationId: org._id,
      roleName: 'Instructor',
    });

    const students = await userSeeder.seedMultiple(organization.studentsCount, {
      organizationId: org._id,
      roleName: 'Student',
    });

    console.log(`  Seeding Courses for ${organization.name}...`);
    const categories = await courseSeeder.seedCategories(org._id, 3);

    const courses: Course[] = [];

    for (const courseConfig of organization.courses) {
      const instructor: any = faker.helpers.arrayElement(instructors);
      const course = await courseSeeder.seedCourse(org._id, instructor._id, instructor.username, [faker.helpers.arrayElement(categories)._id], {
        name: courseConfig.name,
        isPaid: courseConfig.isPaid,
        pricing: courseConfig.pricing as any,
      }, students, courseConfig.contentTypes);
      courses.push(course);
    }

    console.log(`  Seeding Enrollments for ${organization.name}...`);
    let enrollmentConfigIndex = 0;
    for (const student of students) {
      const enrollmentCount = faker.number.int({ min: 1, max: Math.min(courses.length, 3) });
      const shuffledCourses = [...courses].sort(() => 0.5 - Math.random());
      for (let k = 0; k < enrollmentCount; k++) {
        const progressConfig = ENROLLMENT_CONFIG.enrollments[enrollmentConfigIndex % ENROLLMENT_CONFIG.enrollments.length];
        const course = shuffledCourses[k];
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


        await enrollmentSeeder.seedEnrollment(
          student._id,
          course._id,
          org._id,
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
        enrollmentConfigIndex++;


      }
    }
  }

  console.log('Seeding complete!');
  await app.close();
}

bootstrap();
