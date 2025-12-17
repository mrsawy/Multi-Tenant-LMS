import { BillingCycle } from "./enum/BillingCycle.enum";
import { PaginationOptions } from "../Paginated";

export interface ICourseFilters extends PaginationOptions<{
    maxPrice?: number, minPrice?: number, priceCurrency?: string,
    billingCycle?: BillingCycle, minRating?: number, minModules?: number, searchCategories?: string,
    selectedCategory?: string
}> { }