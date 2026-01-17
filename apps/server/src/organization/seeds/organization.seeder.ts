import { Model, Types } from 'mongoose';
import { Organization } from '../entities/organization.entity';
import { fakerAR as faker } from '@faker-js/faker';

export class OrganizationSeeder {
  constructor(private readonly organizationModel: Model<Organization>) {}

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
}
