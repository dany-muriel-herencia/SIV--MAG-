export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PagedResultWithStatus<T> extends PagedResult<T> {
  activesCount: number;
  inactivesCount: number;
}

export interface PagedParams {
  page?: number;
  pageSize?: number;
}