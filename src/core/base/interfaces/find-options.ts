import { Sort } from '../../../common/interfaces/sort';

export interface FindOptions {
  page?: number;
  size?: number;
  sort?: Sort[];
  searchTerm?: string;
  searchCriteria?: string
}
