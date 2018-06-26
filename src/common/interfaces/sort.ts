import { SortDirection } from './sort-direction';

export interface Sort {
  direction: SortDirection;
  field: string;
}