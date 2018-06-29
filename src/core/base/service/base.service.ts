import { FindManyOptions, Like, Repository } from 'typeorm';
import { BaseEntity } from '../entity/base.entity';
import { FindOptions } from '../interfaces/find-options';
import { BadRequestException, NotFoundException, NotImplementedException } from '@nestjs/common';

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
    this.validateEntity(entity);

    return this.repository.save(entity);
  }

  async update(id: number, entity: T): Promise<T> {
    if (id) {
      this.validateEntity(entity);

      const storedEntity = await this.repository.findOne(id);

      if (!storedEntity) {
        throw new BadRequestException('Entity not found');
      }

      const partial = Object.keys(storedEntity)
        .filter(key => key !== 'id' && storedEntity[key] !== entity[key])
        .reduce((acc, key) => Object.assign(acc, { [key]: entity[key] }), {});

      await this.repository.update(id, partial);

      return Object.assign({}, storedEntity, entity, { id });
    } else {
      throw new NotFoundException();
    }
  }

  async deleteEntity(id: number): Promise<T> {
    const storedEntity = await this.repository.findOne(id);

    if (!storedEntity) {
      throw new NotFoundException();
    }

    return this.repository.remove(storedEntity);
  }

  // To be override.
  validateEntity(entity: T) {
    throw new NotImplementedException();
  }
}
