import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from './entities/organization.entity';
import { PlanModule } from 'src/plan/plan.module';
import { OrganizationControllerMessage } from './organization.controller.message';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
    ]),
    PlanModule,
  ],
  controllers: [OrganizationController, OrganizationControllerMessage],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
