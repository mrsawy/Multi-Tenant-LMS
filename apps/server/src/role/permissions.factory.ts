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
      const { action, subject, conditions } = permission;


      // Build condition query
      let conditionQuery: Record<string, any> | undefined = {};

      if (conditions?.includes(Conditions.OWN)) {
        conditionQuery = { ...conditionQuery, [Conditions.OWN]: user._id };
      } else if (conditions?.includes(Conditions.OWN_ORG)) {
        conditionQuery = { ...conditionQuery, [Conditions.OWN_ORG]: user.organizationId }; // Corrected from 'orientation' assuming it was a typo for organization
      } else if (conditions?.includes(Conditions.SELF)) {
        conditionQuery = { ...conditionQuery, [Conditions.SELF]: user._id };
      }

      // Helper function to safely add permissions
      const addPermission = (act: string, subj: string) => {
        try {
          if (conditionQuery) {
            can(act, subj, conditionQuery);
          } else {
            can(act, subj);
          }
        } catch (error) {
          console.error(`Error adding permission can(${act}, ${subj}):`, error);
        }
      };

      // Handle specific action and subject
      if (action !== Actions.MANAGE && subject !== Subjects.ALL) {
        addPermission(action, subject);
        return;
      }

      // Handle action on ALL subjects
      if (subject === Subjects.ALL && action !== Actions.MANAGE) {
        Object.values(Subjects).forEach(sub => {
          if (sub !== Subjects.ALL) { // Skip ALL to avoid recursion
            addPermission(action, sub);
          }
        });
        return;
      }

      // Handle MANAGE action on specific subject
      if (action === Actions.MANAGE && subject !== Subjects.ALL) {
        Object.values(Actions).forEach(act => {
          if (act !== Actions.MANAGE) { // Skip MANAGE to avoid recursion
            addPermission(act, subject);
          }
        });
        return;
      }

      // Handle MANAGE ALL (super admin)
      if (action === Actions.MANAGE && subject === Subjects.ALL) {
        Object.values(Actions).forEach(act => {
          if (act !== Actions.MANAGE) { // Skip MANAGE to avoid recursion
            Object.values(Subjects).forEach(sub => {
              if (sub !== Subjects.ALL) { // Skip ALL to avoid recursion
                addPermission(act, sub);
              }
            });
          }
        });
        return;
      }
    });

    const ability = build({
      detectSubjectType: (item) => {
        // Make sure this returns a string, not undefined
        if (typeof item === 'string') {
          return item;
        }
        if (item && item.constructor) {
          return item.constructor.name;
        }
        return 'Unknown';
      }
    });

    // console.log('Built ability with rules:', ability.rules);
    return ability;
  }
}