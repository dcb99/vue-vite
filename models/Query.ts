export interface Query {
  columnHeaders?: string[];
  readonly paginationProperties?: string[];
  searchFields?: object;
  readonly pageSize?: number;
}
