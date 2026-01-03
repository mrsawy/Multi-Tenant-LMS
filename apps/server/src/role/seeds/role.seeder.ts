import { Model } from 'mongoose';
import { Role } from '../entities/role.entity';
import { Actions } from '../enum/Action.enum';
import { Subjects } from '../enum/subject.enum';

export class RoleSeeder {
  constructor(private readonly roleModel: Model<Role>) {}

  async seed() {
    const roles = [
      {
        name: 'SuperAdmin',
        permissions: [{ action: Actions.MANAGE, subject: Subjects.ALL }],
      },
      {
        name: 'Admin',
        permissions: [
          { action: Actions.MANAGE, subject: Subjects.COURSE },
          { action: Actions.MANAGE, subject: Subjects.CATEGORY },
          { action: Actions.MANAGE, subject: Subjects.USER },
        ],
      },
      {
        name: 'Instructor',
        permissions: [
          { action: Actions.CREATE, subject: Subjects.COURSE },
          { action: Actions.READ, subject: Subjects.COURSE },
          { action: Actions.UPDATE, subject: Subjects.COURSE },
          { action: Actions.DELETE, subject: Subjects.COURSE },
        ],
      },
      {
        name: 'Student',
        permissions: [
          { action: Actions.READ, subject: Subjects.COURSE },
          { action: Actions.CREATE, subject: Subjects.REVIEW },
        ],
      },
    ];

    for (const role of roles) {
      await this.roleModel.findOneAndUpdate({ name: role.name }, role, {
        upsert: true,
        new: true,
      });
    }
    console.log('Roles seeded successfully');
  }
}
