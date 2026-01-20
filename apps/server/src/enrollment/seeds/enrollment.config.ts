import { EnrollmentSeedConfig } from './enrollment-config.interface';
import { faker } from '@faker-js/faker';

export const ENROLLMENT_CONFIG: EnrollmentSeedConfig = {
  enrollments: [
    // Generate varied progress percentages
    ...Array.from({ length: 20 }, () => ({
      progressPercentage: faker.number.int({ min: 0, max: 100 }),
    })),
  ],
};

