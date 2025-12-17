import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Organization } from './entities/organization.entity';
import mongoose, { ClientSession, PaginateModel } from 'mongoose';
import { SubscriptionTypeDef } from 'src/utils/types/Subscription.interface';
import { PlanService } from 'src/plan/plan.service';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Plan } from 'src/plan/entities/plan.entity';
import { SubscriptionDto } from 'src/utils/dto/subscription.dto';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: PaginateModel<Organization>,
    private readonly planService: PlanService,
  ) {}

  async create(
    createOrganizationDto: CreateOrganizationDto,
    session?: ClientSession,
  ) {
    try {
      const createdOrg = new this.organizationModel(createOrganizationDto);
      await createdOrg.save({ session });

      return {
        message: 'Organization created successfully',
        organization: createdOrg,
      };
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw new ConflictException(
          `${field} "${error.keyValue[field]}" already exists.`,
        );
      }
      throw new InternalServerErrorException(
        'Failed to create organization: ' + error.message,
      );
    }
  }

  async filterOne(filters: mongoose.RootFilterQuery<Organization>) {
    const organization = await this.organizationModel.findOne(filters);
    if (!organization) throw new NotFoundException('Organization Not Found');
    return organization;
  }
  async findOne(id: string) {
    const organization = await this.organizationModel.findById(id);
    if (!organization) throw new NotFoundException('Organization Not Found');
    return organization;
  }

  async createOrganizationSubscription(
    organizationId: string,
    planId: string,
    subscriptionData: SubscriptionTypeDef,
  ) {
    try {
      const dtoInstance = plainToInstance(SubscriptionDto, subscriptionData);
      await validateOrReject(dtoInstance);
      const organization = await this.findOne(organizationId);
      const plan = await this.planService.findOne(planId);
      organization.subscription = subscriptionData;
      organization.planName = plan.name;
      await organization.save();
      return organization;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }

  async renewOrganizationSubscription(
    organizationId: string,
    subscriptionData: Partial<SubscriptionTypeDef>,
  ) {
    try {
      const dtoInstance = plainToInstance(SubscriptionDto, subscriptionData);
      await validateOrReject(dtoInstance);
      const organization = await this.findOne(organizationId);
      organization.subscription = {
        ...organization.subscription,
        ...subscriptionData,
      };
      await organization.save();
      return organization;
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error);
    }
  }
}
