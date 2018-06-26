import { FindManyOptions, Like, Repository } from 'typeorm';
import { BaseEntity } from '../entity/base.entity';
import { FindOptions } from '../interfaces/find-options';

export class BaseService<T extends BaseEntity> {

  // public for testing reasons
  constructor(public repository: Repository<T>) {}

  findAll(findOptions: FindOptions = {}): Promise<T[]> {

    const findManyOptions: FindManyOptions = {};

    if (findOptions.size) {
      findManyOptions.take = findOptions.size;
      findManyOptions.skip = (findOptions.page - 1) * findOptions.size;
    }

    if (findOptions.sort && findOptions.sort.length > 0) {
      findManyOptions.order = findOptions.sort.reduce(
        (acc, val) => {
          acc[val.field] = val.direction;
          return acc;
        },
        {}
      );
    }

    if (findOptions.searchCriteria && findOptions.searchTerm) {
      findManyOptions.where = {};

      findManyOptions.where[findOptions.searchCriteria] = Like(`%${findOptions.searchTerm.toLocaleLowerCase()}%`);
    }

    return this.repository.find(findManyOptions);
  }

  save(entity: T): Promise<T> {
    /* tslint:disable */
    return this.repository.save(entity);
  }
}
