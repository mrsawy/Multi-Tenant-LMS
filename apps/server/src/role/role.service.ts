import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './entities/role.entity';
import { Model } from 'mongoose';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>
  ) { }

  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = await this.roleModel.create(createRoleDto);
      return {
        role,
        message: "Role Created Successfully"
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  findAll() {
    return `This action returns all role`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  async update(id: string,  updateRoleDto: UpdateRoleDto) {
    try {
      const updated = await this.roleModel.updateOne({ _id: id }, updateRoleDto);
      return {
        updated,
        message: "Role Updated Successfully"
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
