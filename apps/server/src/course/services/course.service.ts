import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
;import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, {
  ClientSession,
  Connection,
  FilterQuery,
  Model,
  PaginateModel,
  PaginateOptions,
} from 'mongoose';

import { Frequency } from 'src/utils/types/Frequency.enum';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { CurrencyService } from 'src/currency/currency.service';
import { Currency } from 'src/payment/enums/currency.enum';
import { handleError } from 'src/utils/errorHandling';

import { FileService } from 'src/file/file.service';
import { ICourseFilters } from 'src/utils/types/CourseFilters';
import { CategoryService } from 'src/category/category.service';
import { CategoryWithChildren } from 'src/utils/types/CategoryWithChildren ';
import { Course } from '../entities/course.entity';
import { CourseModulesService } from './courseModules.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';
import { CourseModule } from '../course.module';
import { CourseContent } from '../entities/course-content.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Course.name)
    private readonly courseModel: PaginateModel<Course>,
    private readonly currencyService: CurrencyService,
    @Inject(forwardRef(() => CourseModulesService))
    private readonly courseModuleService: CourseModulesService,
    private readonly fileService: FileService,
    private readonly categoryService: CategoryService,
  ) { }

  async create(
    createCourseDto: CreateCourseDto & {
      organizationId: string;
      createdBy: string;
    },
  ) {
    const foundedCourse = await this.courseModel.findOne({
      organizationId: createCourseDto.organizationId,
      name: createCourseDto.name,
    });
    if (foundedCourse)
      throw new BadRequestException(
        'Course With the same name already exist for this organization .',
      );
    if (createCourseDto.isPaid) {
      createCourseDto.pricing = Object.fromEntries(
        Object.entries(createCourseDto.pricing).map(([key, value]) => [
          key,
          {
            ...value,
            priceUSD: this.currencyService.convertToUSD(
              value.originalPrice,
              value.originalCurrency,
            ),
          },
        ]),
      );
    }
    const createdCourse = await this.courseModel.create({ ...createCourseDto });
    return {
      message: 'Course created successfully',
      course: createdCourse,
    };
  }
  
  async findAll(
    filters: mongoose.RootFilterQuery<Course>,
    options: ICourseFilters,
  ) {
    const {
      maxPrice,
      minPrice,
      priceCurrency,
      billingCycle,
      minRating,
      minModules,
      selectedCategory,
      search,
      ...paginateOptions
    } = options;

    const query: mongoose.RootFilterQuery<Course> = { ...filters };

    // Handle search functionality
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search

      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { learningObjectives: { $elemMatch: { $regex: searchRegex } } },
        { 'instructor.username': searchRegex },
        { 'coInstructors.username': searchRegex },
        { 'categories.name': searchRegex },
      ];
    }

    // Handle price filtering
    if (billingCycle && (maxPrice !== undefined || minPrice !== undefined)) {
      const priceField = `pricing.${billingCycle}`;
      const minPriceUSD =
        minPrice !== undefined
          ? priceCurrency
            ? this.currencyService.convertToUSD(minPrice, priceCurrency)
            : minPrice
          : undefined;
      const maxPriceUSD =
        maxPrice !== undefined
          ? priceCurrency
            ? this.currencyService.convertToUSD(maxPrice, priceCurrency)
            : maxPrice
          : undefined;

      if (minPriceUSD !== undefined) {
        query[`${priceField}.priceUSD`] = {
          ...query[`${priceField}.priceUSD`],
          $gte: minPriceUSD,
        };
      }
      if (maxPriceUSD !== undefined) {
        query[`${priceField}.priceUSD`] = {
          ...query[`${priceField}.priceUSD`],
          $lte: maxPriceUSD,
        };
      }
    }

    // Handle rating filter
    if (minRating !== undefined) {
      query['stats.averageRating'] = { $gte: minRating };
    }

    // Handle minimum modules filter
    if (minModules !== undefined) {
      query['modulesIds'] = { $exists: true };
      query.$expr = { $gte: [{ $size: '$modulesIds' }, Number(minModules)] };
    }

    // Handle category filtering with hierarchy
    if (selectedCategory) {
      const categories = (
        await this.categoryService.getAllWithAggregation(
          { search: selectedCategory },
          undefined,
          undefined,
        )
      ).docs;

      function flattenCategories(
        categories: CategoryWithChildren[],
      ): CategoryWithChildren[] {
        const result: CategoryWithChildren[] = [];
        const walk = (category: CategoryWithChildren) => {
          result.push(category);
          category.childCategories?.forEach(walk);
        };
        categories.forEach(walk);
        return result;
      }

      const flattenedCategories = flattenCategories(categories);
      const flattenedCategoriesIds = flattenedCategories.map(
        (cat) => `${cat._id}`,
      );

      query['categoriesIds'] = { $in: flattenedCategoriesIds };
    }

    return await this.courseModel.paginate(query, {
      ...paginateOptions,
      populate: [
        {
          path: 'instructor',
          select: 'username email firstName lastName avatar',
        },
        {
          path: 'categories',
          select: 'name',
        },
      ],
      sort: paginateOptions.sort || { createdAt: -1 }, // Default sort by newest
    });
  }

  async findOne(filters: FilterQuery<Course>, session?: ClientSession) {
    const query = this.courseModel
      .findOne(filters)
      .populate('creator')
      .populate('modules')
      .populate('categories');
    if (session) query.session(session);
    const foundedCourse = await query.exec();
    if (!foundedCourse) throw new NotFoundException('Course Not Found');
    return foundedCourse;
  }

  async findOneById(id: string, session?: ClientSession) {
    const query = this.courseModel
      .findById(id)
      .populate('creator')
      .populate('modules')
      .populate('categories');
    if (session) query.session(session);
    const foundedCourse = await query.exec();
    if (!foundedCourse) throw new NotFoundException('Course Not Found');
    return foundedCourse;
  }

  async update(updateCourseDto: UpdateCourseDto) {
    try {
      if (updateCourseDto.isPaid && updateCourseDto.pricing) {
        updateCourseDto.pricing = Object.fromEntries(
          Object.entries(updateCourseDto.pricing).map(([key, value]) => [
            key,
            {
              ...value,
              priceUSD: this.currencyService.convertToUSD(
                value.originalPrice,
                value.originalCurrency,
              ),
            },
          ]),
        );
      }

      const result = await this.courseModel.updateOne(
        { _id: updateCourseDto.courseId },
        updateCourseDto,
      );
      const course = await this.courseModel.findById(updateCourseDto.courseId);
      console.log({ course });
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

  async getCourseWithOrderedModules(
    courseId: string,
    includeContents = false,
    contentSelect = 'title type', // e.g. "title type" or "-_id title"
  ) {
    const populateConfig: any = {
      path: 'modules',
      options: { sort: { order: 1 } },
    };

    if (includeContents) {
      populateConfig.populate = {
        path: 'contents', // Changed from 'contentsIds' to 'contents' (the virtual field)
        model: 'CourseContent',
        ...(contentSelect ? { select: contentSelect } : {}), // select fields if provided
      };
    }

    const course = await this.courseModel
      .findById(courseId)
      .populate('categories')
      .populate('instructor')
      .populate('coInstructors')
      .populate(populateConfig);

    if (!course) throw new NotFoundException('Course not found');

    // If contents included, restore order manually
    if (includeContents) {
      (course as any).modules.forEach((module) => {
        module.contentsIds = module.contentsIds.sort(
          (a, b) =>
            module.contentsIds
              .map((id) => id._id.toString())
              .indexOf(a._id.toString()) -
            module.contentsIds
              .map((id) => id._id.toString())
              .indexOf(b._id.toString()),
        );
      });
    }

    return course;
  }

  async addModuleToCourse(
    courseId: string,
    moduleId: string,
    session?: ClientSession,
  ) {
    try {
      const result = await this.courseModel.updateOne(
        { _id: courseId },
        { $addToSet: { modulesIds: new mongoose.Types.ObjectId(moduleId) } },
        { session },
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

  async removeModuleFromCourse(
    courseId: string,
    moduleId: string,
    session?: ClientSession,
  ) {
    try {
      const result = await this.courseModel.updateOne(
        { _id: courseId },
        { $pull: { modulesIds: new mongoose.Types.ObjectId(moduleId) } },
        { session },
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

  async removeModulesFromCourse(
    courseId: string,
    moduleIds: string[],
    session?: ClientSession,
  ) {
    try {
      const result = await this.courseModel.updateOne(
        { _id: courseId },
        {
          $pullAll: {
            modulesIds: moduleIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
        { session },
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
      const currentModuleIds = course.modulesIds.map((id) => id.toString());

      // Validate that all new IDs exist in current modules
      const invalidIds = newOrder.filter(
        (id) => !currentModuleIds.includes(id),
      );
      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `Invalid module IDs: ${invalidIds.join(', ')}`,
        );
      }

      // Validate that all current modules are included in new order
      const missingIds = currentModuleIds.filter(
        (id) => !newOrder.includes(id),
      );
      if (missingIds.length > 0) {
        throw new BadRequestException(
          `Missing module IDs: ${missingIds.join(', ')}`,
        );
      }

      // Convert to ObjectIds and update
      const validIds = newOrder.map((id) => new mongoose.Types.ObjectId(id));

      const result = await this.courseModel.updateOne(
        { _id: courseId },
        { $set: { modulesIds: validIds } },
      );

      return {
        message: 'Module order updated successfully',
        updated: true,
        newOrder: validIds,
      };
    } catch (error) {
      console.error(error);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  getCoursePricing(
    course: Course,
    frequency: Frequency,
    userCurrency?: Currency,
  ): { price: number; currency: Currency } {
    if (!course.isPaid || !course.pricing)
      return { price: 0, currency: Currency.USD };

    let price = 0;
    let currency: Currency = Currency.USD;
    switch (frequency) {
      case Frequency.MONTHLY:
        const pricing = course.pricing[BillingCycle.MONTHLY];
        if (!pricing)
          throw new Error('Monthly pricing not available for this course.');
        if (userCurrency === pricing.originalCurrency) {
          currency = pricing.originalCurrency;
          price = pricing.originalPrice;
        } else {
          price = pricing.priceUSD;
        }
        break;
      case Frequency.YEARLY:
        const yearlyPricing = course.pricing[BillingCycle.YEARLY];
        if (!yearlyPricing)
          throw new Error('Yearly pricing not available for this course.');
        if (userCurrency === yearlyPricing.originalCurrency) {
          currency = yearlyPricing.originalCurrency;
          price = yearlyPricing.originalPrice;
        } else {
          price = yearlyPricing.priceUSD;
        }
        break;
      default:
        throw new Error(
          'Invalid frequency. Use 30 for monthly, 365 for yearly, or 1 for one-time.',
        );
    }

    return { price, currency };
  }

  async deleteCourses(coursesIds: string[]) {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const courses = await this.courseModel
        .find({
          _id: { $in: coursesIds.map((id) => new mongoose.Types.ObjectId(id)) },
        })
        .session(session);

      for (const course of courses) {
        await this.courseModuleService.deleteModules(
          course.modulesIds.map((id) => id.toString()),
          session,
        );
        if (course.thumbnailKey) {
          await this.fileService.deleteFile(course.thumbnailKey);
        }
      }

      await this.courseModel
        .deleteMany({ _id: { $in: coursesIds } })
        .session(session);
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

  async getCourseWithOrderedModulesAndContents(
    courseId: string,
  ): Promise<
    Course & { modules: (CourseModule & { contents: (CourseContent & { _id: mongoose.Types.ObjectId })[] })[] }
  > {
    try {
      const result = await this.courseModel.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(courseId) } },

        // Lookup categories
        {
          $lookup: {
            from: 'categories',
            localField: 'categoriesIds',
            foreignField: '_id',
            as: 'categories',
          },
        },

        // Lookup instructor
        {
          $lookup: {
            from: 'users',
            localField: 'instructorId',
            foreignField: '_id',
            as: 'instructor',
          },
        },
        { $unwind: { path: '$instructor', preserveNullAndEmptyArrays: true } },

        // Lookup co-instructors
        {
          $lookup: {
            from: 'users',
            localField: 'coInstructorsIds',
            foreignField: '_id',
            as: 'coInstructors',
          },
        },

        // Lookup modules
        {
          $lookup: {
            from: 'course_modules',
            localField: 'modulesIds',
            foreignField: '_id',
            as: 'modulesData',
          },
        },

        // Preserve the order of modules
        {
          $addFields: {
            modules: {
              $map: {
                input: '$modulesIds',
                as: 'moduleId',
                in: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$modulesData',
                        cond: { $eq: ['$$this._id', '$$moduleId'] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },

        // Lookup contents for each module
        {
          $lookup: {
            from: 'course_contents',
            localField: 'modules.contentsIds',
            foreignField: '_id',
            as: 'allContents',
          },
        },

        // Map contents to each module in order
        {
          $addFields: {
            modules: {
              $map: {
                input: '$modules',
                as: 'module',
                in: {
                  $mergeObjects: [
                    '$$module',
                    {
                      contents: {
                        $map: {
                          input: '$$module.contentsIds',
                          as: 'contentId',
                          in: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$allContents',
                                  cond: { $eq: ['$$this._id', '$$contentId'] },
                                },
                              },
                              0,
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },

        // Remove temporary fields
        {
          $project: {
            modulesData: 0,
            allContents: 0,
          },
        },
      ]);

      if (!result || result.length === 0) {
        throw new NotFoundException('Course not found');
      }

      return result[0];
    } catch (error) {
      console.error({ error });
      console.dir({ error }, { depth: null });
      throw error;
    }
  }


  async getCoursePrice({ currency, courseId, billingCycle }:
    { courseId: string, billingCycle: BillingCycle, currency: Currency }): Promise<{ price: number, course: Course }> {

    const course = await this.findOneById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    if (!course.pricing[billingCycle]) throw new BadRequestException('Course price for the selected billing cycle is not available');

    if ((currency === course.pricing[billingCycle].originalCurrency) && !!course.pricing[billingCycle].originalPrice) {
      return { price: course.pricing[billingCycle].originalPrice, course };
    }

    const price = course.pricing[billingCycle]?.priceUSD;
    if (!price) throw new BadRequestException('Course price for the selected billing cycle is not available');

    const resultPrice = this.currencyService.convertFromUSD(price, currency)
    return { price: resultPrice, course };
  }

}
