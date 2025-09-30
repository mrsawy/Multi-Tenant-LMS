import { BillingCycle } from "../enums/billingCycle.enum";
import { PaginateOptions } from "mongoose";


export interface ICourseFilters extends PaginateOptions {
    maxPrice?: number, minPrice?: number, priceCurrency?: string,
    billingCycle?: BillingCycle, minRating?: number, minModules?: number, selectedCategory?: string,
}