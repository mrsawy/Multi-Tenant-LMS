import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { handleError } from 'src/utils/errorHandling';

const saltRounds = 10;


@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) { }
  async create(createUserDto: CreateUserDto & { organization: string }, session?: ClientSession) {
    try {

      const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

      const createdUser = new this.userModel({ ...createUserDto, password: hashedPassword });
      await createdUser.save({ session });
      return createdUser
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        throw new ConflictException(`${field} "${error.keyValue[field]}" already exists.`);
      }
      throw new InternalServerErrorException('Failed to create User');
    }
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(identifier: string) {
    try {
      const user = await this.userModel.findOne({
        $or: [
          { username: identifier },
          { email: identifier },
          { phone: identifier },
        ],
      }).populate({
        path: 'role',
        model: 'Role',
        localField: 'role',
        foreignField: 'name'
      }).populate("organization");

      return user;
    } catch (error) {
      throw new Error("Could'nt find user:", error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {

      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, saltRounds); // Hashed
      }

      const result = await this.userModel.updateOne({ _id: id }, { $set: updateUserDto });
      if (result.matchedCount === 0) {
        throw new NotFoundException('User not found');
      }

      if (result.modifiedCount === 0) {
        return {
          message: 'User matched but no changes were made',
          updated: false,
        };
      }

      return {
        message: 'User updated successfully',
        updated: true,
      };
    } catch (error) {
      handleError(error)
    }

  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
