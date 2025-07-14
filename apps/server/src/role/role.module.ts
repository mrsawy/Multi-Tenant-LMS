import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { CaslAbilityFactory } from './permissions.factory';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  // imports: [],
  controllers: [RoleController],
  providers: [RoleService, CaslAbilityFactory, PermissionsGuard ],
})
export class RoleModule { }
