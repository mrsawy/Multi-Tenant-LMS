import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './entities/course.entity';
import { Model } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>
  ) { }

  async create(createCourseDto: CreateCourseDto & { organization?: string, createdBy?: string }) {
    try {
      const createdCourse = await this.courseModel.create(createCourseDto)
      return {
        message: 'Course created successfully',
        course: createdCourse,
      };
    } catch (error) {
      console.error(error)
      throw new InternalServerErrorException(error)
    }
  }

  findAll() {
    return `This action returns all course`;
  }

  async findOne(id: string) {
    return await this.courseModel.findById(id);
  }

  async update(id: string, updateCourseDto: UpdateCourseDto) {
    try {
      const result = await this.courseModel.updateOne({ _id: id }, updateCourseDto);

      if (result.matchedCount === 0) {
        throw new NotFoundException('Course not found');
      }

      if (result.modifiedCount === 0) {
        return {
          message: 'Course matched but no changes were made',
          updated: false,
        };
      }

      return {
        message: 'Course updated successfully',
        updated: true,
      };

    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
