export interface PaginationInterface {
  limit: number;
  skip: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export type PaginationType<T> = {
  data: T[];
  pagination: PaginationInterface;
};
