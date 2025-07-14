import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Organization } from './entities/organization.entity';
import { PaginateModel } from 'mongoose';

@Injectable()
export class OrganizationService {


  constructor(@InjectModel(Organization.name) private readonly organizationModel: PaginateModel<Organization>) { }



  async create(createOrganizationDto: CreateOrganizationDto) {

    try {
      const createdOrg = new this.organizationModel(createOrganizationDto);
      return await createdOrg.save();
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw new ConflictException(`${field} "${error.keyValue[field]}" already exists.`);
      }
      throw new InternalServerErrorException('Failed to create organization');
    }
  }

  findAll() {
    return `This action returns all organization`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organization`;
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }
}
