import { PaginationOptions } from '../Paginated';

export interface IInstructorFilters extends PaginationOptions<{
    search?: string;
    minRating?: number;
    searchCategories?: string;
    selectedCategory?: string;
}> { }
