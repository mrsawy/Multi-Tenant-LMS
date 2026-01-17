import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { Roles } from 'src/role/enum/Roles.enum';

/**
 * Validates that a field is only acceptable when the role is INSTRUCTOR.
 * Rejects the field if it's provided for non-instructor roles.
 */
export function IsInstructorOnly(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isInstructorOnly',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const obj = args.object as { roleName?: string };
          const roleName = obj.roleName;

          // If field is not provided, it's valid (handled by @IsOptional)
          if (value === undefined || value === null) {
            return true;
          }

          // If field is provided, role must be INSTRUCTOR
          // Note: In update scenarios, if roleName is not in the payload,
          // this will reject categoriesIds (safe default behavior)
          if (
            roleName &&
            roleName.toLowerCase() === Roles.INSTRUCTOR.toLowerCase()
          ) {
            return true;
          }

          // Field provided but role is not INSTRUCTOR or roleName is missing - reject
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is only acceptable for ${Roles.INSTRUCTOR} role`;
        },
      },
    });
  };
}
