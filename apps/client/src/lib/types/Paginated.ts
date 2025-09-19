export interface Paginated<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export type PaginationOptions<T = unknown> = {
  page?: number;
  limit?: number;
  search?: string;
} & T;

// export const defaultPagination = { page: 1, limit: 10, search: undefined };

// optional helper to apply default pagination values
export function withDefaults<T>(opts: PaginationOptions<T>): PaginationOptions<T> {
    return {
        page: 1,
        limit: 10,
        search: undefined,
        ...opts,
    };
}