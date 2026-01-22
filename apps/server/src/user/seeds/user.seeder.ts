import { Model, Types } from 'mongoose';
import { User } from '../entities/user.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { fakerAR as faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { Currency } from '../../payment/enums/currency.enum';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Roles } from 'src/role/enum/Roles.enum';

export class UserSeeder {
  constructor(
    private readonly userModel: Model<User>,
    private readonly walletModel: Model<Wallet>,
  ) { }

  async seedUser(overrides: Partial<User> = {}) {
    const password = await bcrypt.hash('password123', 10);
    const userId = new Types.ObjectId();
    const walletId = new Types.ObjectId();

    const user = {
      _id: userId,
      username: faker.internet.username().toLowerCase(),
      email: faker.internet.email().toLowerCase(),
      phone: (() => {
        const raw = faker.phone.number();
        const parsed = parsePhoneNumberFromString(raw, 'EG') || parsePhoneNumberFromString(raw, 'US');
        return parsed ? parsed.format('E.164') : raw;
      })(),
      password,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      roleName: Roles.STUDENT,
      status: 'ACTIVE',
      preferredCurrency: Currency.EGP,
      walletId,
      profile: {
        bio: faker.lorem.paragraph(),
        shortBio: faker.lorem.sentence(),
        avatar: faker.image.avatar(),
        dateOfBirth: faker.date.birthdate(),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        socialLinks: {
          linkedin: `https://linkedin.com/in/${faker.internet.username()}`,
          twitter: `https://twitter.com/${faker.internet.username()}`,
        },
      },
      ...overrides,
    };

    const createdUser = await this.userModel.create(user);

    await this.walletModel.create({
      _id: walletId,
      userId: createdUser._id,
      organizationId: createdUser.organizationId || null,
      balance: faker.number.int({ min: 100, max: 1000 }),
      currency: createdUser.preferredCurrency || 'USD',
      isActive: true,
    });

    return createdUser;
  }

  async seedMultiple(count: number, overrides: Partial<User> = {}) {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.seedUser(overrides));
    }
    return users;
  }
}
