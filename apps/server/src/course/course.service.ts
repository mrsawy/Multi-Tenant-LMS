import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { CreateCourseDto, PricingDetailsDto, PricingDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Course } from './entities/course.entity';
import mongoose, { ClientSession, Connection, Model, PaginateModel } from 'mongoose';

import { Frequency } from 'src/utils/types/Frequency.enum';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { CurrencyService } from 'src/currency/currency.service';
import { Currency } from 'src/payment/enums/currency.enum';
import { handleError } from 'src/utils/errorHandling';
import { PaginateOptions } from 'src/utils/types/PaginateOptions';
import { CourseModulesService } from './courseModules.service';
import { FileService } from 'src/file/file.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Course.name) private readonly courseModel: PaginateModel<Course>
    , private readonly currencyService: CurrencyService,
    @Inject(forwardRef(() => CourseModulesService)) private readonly courseModuleService: CourseModulesService,
    private readonly fileService: FileService
  ) { }

  async create(createCourseDto: CreateCourseDto & { organizationId: string, createdBy: string }) {
    const foundedCourse = await this.courseModel.findOne({ organizationId: createCourseDto.organizationId, name: createCourseDto.name })
    if (foundedCourse) throw new BadRequestException("Course With the same name already exist for this organization .")
    const createdCourse = await this.courseModel.create({ ...createCourseDto, pricing: this.transformPricing(createCourseDto.pricing) });
    return {
      message: 'Course created successfully',
      course: createdCourse,
    };
  }

  async findAll(filters: mongoose.RootFilterQuery<Course>, options: PaginateOptions) {
    return await this.courseModel.paginate(filters, options)
  }

  async findOne(id: string, session?: ClientSession) {
    const query = this.courseModel.findById(id);
    if (session) query.session(session);
    const foundedCourse = await query.exec();
    if (!foundedCourse) throw new NotFoundException("Course Not Found")
    return foundedCourse;
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

  async findCourseWithOrderedModules(courseId: string) {
    return await this.courseModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(courseId) } },
      {
        $lookup: {
          from: 'course_modules',
          localField: 'modulesIds',
          foreignField: '_id',
          as: 'modules'
        }
      },
      {
        $addFields: {
          modules: {
            $map: {
              input: '$modulesIds',
              as: 'moduleId',
              in: {
                $arrayElemAt: [
                  '$modules',
                  {
                    $indexOfArray: [
                      '$modules._id',
                      '$$moduleId'
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);
  }

  async addModuleToCourse(courseId: string, moduleId: string, session?: ClientSession) {
    try {
      const result = await this.courseModel.updateOne(
        { _id: courseId },
        { $addToSet: { modulesIds: new mongoose.Types.ObjectId(moduleId) } }, { session }
      );

      if (result.matchedCount === 0) {
        throw new NotFoundException('Course not found');
      }

      return {
        message: 'Module added to course successfully',
        updated: true,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async removeModuleFromCourse(courseId: string, moduleId: string, session?: ClientSession) {
    try {
      const result = await this.courseModel.updateOne(
        { _id: courseId },
        { $pull: { modulesIds: new mongoose.Types.ObjectId(moduleId) } },
        { session }
      );

      if (result.matchedCount === 0) {
        throw new NotFoundException('Course not found');
      }

      return {
        message: 'Module removed from course successfully',
        updated: true,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async removeModulesFromCourse(courseId: string, moduleIds: string[], session?: ClientSession) {
    try {
      const result = await this.courseModel.updateOne(
        { _id: courseId },
        { $pullAll: { modulesIds: moduleIds.map(id => new mongoose.Types.ObjectId(id)) } },
        { session }
      );

      if (result.matchedCount === 0) {
        throw new NotFoundException('Course not found');
      }

      return {
        message: 'Modules removed from course successfully',
        updated: true,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async reorderModules(courseId: string, newOrder: string[]) {
    try {
      // First, get the current course to validate
      const course = await this.courseModel.findById(courseId);
      if (!course) {
        throw new NotFoundException('Course not found');
      }

      // Get current module IDs as strings for comparison
      const currentModuleIds = course.modulesIds.map(id => id.toString());

      // Validate that all new IDs exist in current modules
      const invalidIds = newOrder.filter(id => !currentModuleIds.includes(id));
      if (invalidIds.length > 0) {
        throw new BadRequestException(`Invalid module IDs: ${invalidIds.join(', ')}`);
      }

      // Validate that all current modules are included in new order
      const missingIds = currentModuleIds.filter(id => !newOrder.includes(id));
      if (missingIds.length > 0) {
        throw new BadRequestException(`Missing module IDs: ${missingIds.join(', ')}`);
      }

      // Convert to ObjectIds and update
      const validIds = newOrder.map(id => new mongoose.Types.ObjectId(id));

      const result = await this.courseModel.updateOne(
        { _id: courseId },
        { $set: { modulesIds: validIds } }
      );

      return {
        message: 'Module order updated successfully',
        updated: true,
        newOrder: validIds
      };
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  getCoursePricing(course: Course, frequency: Frequency, userCurrency?: Currency): { price: number, currency: Currency } {

    if (!course.isPaid || !course.pricing) return { price: 0, currency: Currency.USD };

    let price = 0;
    let currency: Currency = Currency.USD;
    switch (frequency) {
      case Frequency.MONTHLY:
        const pricing = course.pricing[BillingCycle.MONTHLY];
        if (!pricing) throw new Error('Monthly pricing not available for this course.');
        if (userCurrency === pricing.originalCurrency) {
          currency = pricing.originalCurrency;
          price = pricing.originalPrice;
        } else {
          price = pricing.priceUSD;
        }
        break;
      case Frequency.YEARLY:
        const yearlyPricing = course.pricing[BillingCycle.YEARLY];
        if (!yearlyPricing) throw new Error('Yearly pricing not available for this course.');
        if (userCurrency === yearlyPricing.originalCurrency) {
          currency = yearlyPricing.originalCurrency;
          price = yearlyPricing.originalPrice;
        } else {
          price = yearlyPricing.priceUSD;
        } break;
      default:
        throw new Error('Invalid frequency. Use 30 for monthly, 365 for yearly, or 1 for one-time.');
    }

    return { price, currency };


  }



  private transformPricing(pricing?: PricingDto) {
    if (!pricing) {
      return {
        [BillingCycle.MONTHLY]: undefined,
        [BillingCycle.YEARLY]: undefined,
        [BillingCycle.ONE_TIME]: undefined,
      };
    }

    const transformBillingCycle = (billingCycle: any) => {
      if (!billingCycle ||
        typeof billingCycle.price !== 'number' ||
        !billingCycle.currency ||
        billingCycle.price < 0) {
        return undefined;
      }

      try {
        return {
          originalPrice: billingCycle.price,
          originalCurrency: billingCycle.currency,
          priceUSD: this.currencyService.convertToUSD(
            billingCycle.price,
            billingCycle.currency
          ),
        };
      } catch (error) {
        // If currency conversion fails, return undefined
        return undefined;
      }
    };

    return {
      [BillingCycle.MONTHLY]: transformBillingCycle(pricing[BillingCycle.MONTHLY]),
      [BillingCycle.YEARLY]: transformBillingCycle(pricing[BillingCycle.YEARLY]),
      [BillingCycle.ONE_TIME]: transformBillingCycle(pricing[BillingCycle.ONE_TIME]),
    };
  }



  async deleteCourses(coursesIds: string[]) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const courses = await this.courseModel.find({ _id: { $in: coursesIds.map(id => new mongoose.Types.ObjectId(id)) } }).session(session)

      for (const course of courses) {
        await this.courseModuleService.deleteModules(course.modulesIds.map(id => id.toString()), session)
        if (course.thumbnailKey) {
          await this.fileService.deleteFile(course.thumbnailKey)
        }
      }

      await this.courseModel.deleteMany({ _id: { $in: coursesIds } }).session(session)

    } catch (error) {
      await session.abortTransaction();
      console.error('Error deleting Courses:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete Courses');
    } finally {
      await session.endSession();
    }



  }

}
