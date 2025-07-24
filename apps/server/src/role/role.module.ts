import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { CaslAbilityFactory } from './permissions.factory';
import { PermissionsGuard } from './guards/permissions.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './entities/role.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }])
  ],
  controllers: [RoleController],
  providers: [RoleService, CaslAbilityFactory, PermissionsGuard],
})
export class RoleModule { }
