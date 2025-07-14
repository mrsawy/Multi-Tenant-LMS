import { AbilityBuilder, AbilityClass, createMongoAbility, ExtractSubjectType, MongoAbility } from '@casl/ability';
import { Actions } from './enum/Action.enum';
import { Subjects } from './enum/subject.enum';
import { Injectable } from '@nestjs/common';
import { User, UserDocument } from 'src/user/entities/user.entity';
import { Role } from './entities/role.entity';
import { Conditions } from './enum/Conditions.enum';

export type AppAbility = MongoAbility;

@Injectable()
export class CaslAbilityFactory {
   createForUser(user: UserDocument & { role: Role }): AppAbility {
    const { can, build } = new AbilityBuilder(createMongoAbility);

    user.role.permissions.forEach(permission => {
      const { action, subject, condition } = permission;

      if (condition === Conditions.OWN) {
        // User can only perform action on their own resources
        can(action, subject, { userId: user._id });
      } else {
        // User can perform action on all resources of this type
        can(action, subject);
      }
    });

    return build();
  }
}
