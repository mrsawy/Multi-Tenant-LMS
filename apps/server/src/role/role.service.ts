import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './entities/role.entity';
import { Model, Types } from 'mongoose';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = await this.roleModel.create(createRoleDto);
      return {
        role,
        message: 'Role Created Successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  findAll() {
    return `This action returns all role`;
  }

  async findOne(id: string) {
    const filter = Types.ObjectId.isValid(id) ? { _id: id } : { name: id };

    const foundedRole = await this.roleModel.findOne(filter);

    console.log({ foundedRole });

    if (!foundedRole) {
      throw new NotFoundException('Role not found');
    }
    return foundedRole;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      console.log({ updateRoleDto, p: updateRoleDto.permissions });

      const filter = Types.ObjectId.isValid(id) ? { _id: id } : { name: id };

      const updated = await this.roleModel.updateOne(filter, updateRoleDto);

      return {
        updated,
        message: 'Role Updated Successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
