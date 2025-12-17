import { Currency } from 'src/payment/enums/currency.enum';
import { BillingCycle } from '../enums/billingCycle.enum';
import { PaginateOptions } from 'mongoose';

export interface ICourseFilters extends PaginateOptions {
  maxPrice?: number;
  minPrice?: number;
  priceCurrency?: Currency;
  billingCycle?: BillingCycle;
  minRating?: number;
  minModules?: number;
  search?: string;
  selectedCategory?: string;
}
