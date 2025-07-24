import { SetMetadata } from '@nestjs/common';
import { PermissionDto } from './dto/update-role.dto';

export const PERMISSIONS_KEY = 'permissions';
export const RequiredPermissions = (...permissions: PermissionDto[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);