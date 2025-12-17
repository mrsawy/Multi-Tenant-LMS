import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory } from '../permissions.factory';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface RequiredPermission {
  action: string;
  subject: string;
  conditions?: any;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const requiredPermissions = this.reflector.get<RequiredPermission[]>(
        PERMISSIONS_KEY,
        context.getHandler(),
      );

      if (!requiredPermissions) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }

      const ability = this.caslAbilityFactory.createForUser(user);

      const isAllowed = requiredPermissions.every((permission) => {
        // Always check with just action and subject
        // The conditions are already built into the ability rules
        const isAllowed = ability.can(permission.action, permission.subject);

        if (!isAllowed) {
          throw new ForbiddenException(
            `Insufficient permissions. Required: ${permission.action} ${permission.subject}`,
          );
        }

        return isAllowed;
      });

      request.userAbility = ability; // Attach ability to request for further use

      return isAllowed;
    } catch (error) {
      console.error('Permission check error:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || 'An error occurred while checking permissions',
      );
    }
  }

  // Helper method for checking specific resource instances
  // Use this when you have the actual resource object
  canAccessResource(
    ability: any,
    action: string,
    subject: string,
    resource: any,
  ): boolean {
    try {
      return ability.can(action, subject, resource);
    } catch (error) {
      console.error(`Error checking resource access:`, error);
      return false;
    }
  }
}
