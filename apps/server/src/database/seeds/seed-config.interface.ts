import { BillingCycle } from 'src/utils/enums/billingCycle.enum';
import { ContentType } from '../../course/enum/contentType.enum';
import { Currency } from 'src/payment/enums/currency.enum';

export interface CourseSeedConfig {
  name: string;
  isPaid: boolean;
  categories?: string[]; // Category names for this course
  contentTypes?: ContentType[]; // Optional: specify which content types to use
  pricing?: {
    [BillingCycle.MONTHLY]?: {
      originalPrice: number;
      originalCurrency: Currency;
      priceUSD?: number;
    };
    [BillingCycle.YEARLY]?: {
      originalPrice: number;
      originalCurrency: Currency;
      priceUSD?: number;
    };
    [BillingCycle.ONE_TIME]?: {
      originalPrice: number;
      originalCurrency: Currency;
      priceUSD?: number;
    };
  };
  discussions?: {
    title: string;
    content: string;
  }[];
  reviews?: {
    rating: number;
    comment: string;
  }[];
}

export interface OrganizationSeedConfig {
  name: string;
  studentsCount: number;
  teachersCount: number;
  adminsCount: number;
  totalCourses?: number; // Optional: will default to courses.length if not provided
  courses: CourseSeedConfig[];
}