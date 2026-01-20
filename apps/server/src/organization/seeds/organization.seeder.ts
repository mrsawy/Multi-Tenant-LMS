import { Model, Types } from 'mongoose';
import { Organization } from '../entities/organization.entity';
import { fakerAR as faker } from '@faker-js/faker';
import { ReviewType } from 'src/review/enum/reviewType.enum';

export class OrganizationSeeder {
  constructor(
    private readonly organizationModel: Model<Organization>,
    private readonly enrollmentModel?: Model<any>,
    private readonly reviewModel?: Model<any>,
    private readonly courseModel?: Model<any>,
  ) { }

  async seed(superAdminId: Types.ObjectId, planName: string, overrides: Partial<Organization> = {}) {
    const name = faker.company.name();
    const organization = {
      name,
      superAdminId,
      slug: faker.helpers.slugify(name).toLowerCase() + '-' + faker.string.alphanumeric(5),
      planName,
      settings: {
        branding: {
          logo: faker.image.url(),
          primaryColor: faker.color.rgb(),
          secondaryColor: faker.color.rgb(),
        },
        notifications: {
          emailEnabled: true,
          smsEnabled: false,
        },
      },
      ...overrides,
    };

    return await this.organizationModel.create(organization);
  }

  /**
   * Updates organization statistics (totalEnrollments, totalReviews, averageRating, totalCourses)
   * @param organizationId - The organization ID to update
   * @param totalCourses - Optional: total courses count (if not provided, will be calculated from database)
   */
  async updateOrganizationStats(organizationId: Types.ObjectId, totalCourses?: number) {
    if (!this.enrollmentModel || !this.reviewModel || !this.courseModel) {
      throw new Error('Enrollment, Review, and Course models must be provided to update organization stats');
    }

    // Count total enrollments for the organization
    const totalEnrollments = await this.enrollmentModel.countDocuments({
      organizationId: organizationId,
    });

    // Count organization reviews and calculate average rating
    const organizationReviews = await this.reviewModel.find({
      reviewType: ReviewType.ORGANIZATION,
      reviewedOrganizationId: organizationId,
      isActive: true,
    });

    const totalReviews = organizationReviews.length;
    const averageRating = totalReviews > 0
      ? Math.round((organizationReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews) * 10) / 10
      : 0;

    // Get totalCourses from parameter or calculate from database
    let finalTotalCourses = totalCourses;
    if (finalTotalCourses === undefined) {
      finalTotalCourses = await this.courseModel.countDocuments({
        organizationId: organizationId,
      });
    }

    // Update organization stats
    await this.organizationModel.findByIdAndUpdate(
      organizationId,
      {
        $set: {
          'stats.totalCourses': finalTotalCourses,
          'stats.totalEnrollments': totalEnrollments,
          'stats.totalReviews': totalReviews,
          'stats.averageRating': averageRating,
        },
      }
    );
  }
}