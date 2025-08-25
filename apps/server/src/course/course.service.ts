import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCourseDto, PricingDetailsDto, PricingDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Course } from './entities/course.entity';
import { Model } from 'mongoose';
import { Currency } from 'src/payment/enums/currency.enum';
import { Frequency } from 'src/utils/types/Frequency.enum';
import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { CurrencyService } from 'src/currency/currency.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private readonly courseModel: Model<Course>
    , private readonly currencyService: CurrencyService
  ) { }

  async create(createCourseDto: CreateCourseDto & { organizationId: string, createdBy: string }) {
    try {
      const createdCourse = await this.courseModel.create({ ...createCourseDto, pricing: this.transformPricing(createCourseDto.pricing) });
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
    const foundedCourse = await this.courseModel.findById(id);
    if (!foundedCourse) throw new NotFoundException("Course Not Found")
    return foundedCourse
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
          price = pricing.originalPice;
        } else {
          price = pricing.priceUSD;
        }
        break;
      case Frequency.YEARLY:
        const yearlyPricing = course.pricing[BillingCycle.YEARLY];
        if (!yearlyPricing) throw new Error('Yearly pricing not available for this course.');
        if (userCurrency === yearlyPricing.originalCurrency) {
          currency = yearlyPricing.originalCurrency;
          price = yearlyPricing.originalPice;
        } else {
          price = yearlyPricing.priceUSD;
        } break;
      default:
        throw new Error('Invalid frequency. Use 30 for monthly, 365 for yearly, or 1 for one-time.');
    }

    return { price, currency };


  }



  private transformPricing(pricing: PricingDto) {
    return {
      [BillingCycle.MONTHLY]: pricing[BillingCycle.MONTHLY]
        ? {
          originalPice: pricing[BillingCycle.MONTHLY].price,
          originalCurrency: pricing[BillingCycle.MONTHLY].currency,
          priceUSD: this.currencyService.convertToUSD(
            pricing[BillingCycle.MONTHLY].price,
            pricing[BillingCycle.MONTHLY].currency
          ),
        }
        : undefined,
      [BillingCycle.YEARLY]: pricing[BillingCycle.YEARLY]
        ? {
          originalPice: pricing[BillingCycle.YEARLY].price,
          originalCurrency: pricing[BillingCycle.YEARLY].currency,
          priceUSD: this.currencyService.convertToUSD(
            pricing[BillingCycle.YEARLY].price,
            pricing[BillingCycle.YEARLY].currency
          ),
        }
        : undefined,
      [BillingCycle.ONE_TIME]: pricing[BillingCycle.ONE_TIME]
        ? {
          originalPice: pricing[BillingCycle.ONE_TIME].price,
          originalCurrency: pricing[BillingCycle.ONE_TIME].currency,
          priceUSD: this.currencyService.convertToUSD(
            pricing[BillingCycle.ONE_TIME].price,
            pricing[BillingCycle.ONE_TIME].currency
          ),
        }
        : undefined,
    };
  }


}
