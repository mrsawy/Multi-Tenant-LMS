import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) { }
  async create(createUserDto: CreateUserDto, session?: ClientSession) {
    try {

      const createdUser = new this.userModel(createUserDto);
      await createdUser.save({ session });

      return {
        user: createdUser,
        message: "User Created Successfully"
      }

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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
