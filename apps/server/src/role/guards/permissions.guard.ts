import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
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
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.get<RequiredPermission[]>(
            PERMISSIONS_KEY,
            context.getHandler(),
        );

        if (!requiredPermissions) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user; // Assuming user is attached by auth guard

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const ability = this.caslAbilityFactory.createForUser(user);

        return requiredPermissions.every(permission => {
            const isAllowed = ability.can(
                permission.action,
                permission.subject,
                permission.conditions || request.params || request.body,
            );

            if (!isAllowed) {
                throw new ForbiddenException(
                    `Insufficient permissions. Required: ${permission.action} ${permission.subject}`,
                );
            }

            return isAllowed;
        });
    }
}