import { Body, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { BaseService } from '../service/base.service';
import { BaseEntity } from '../entity/base.entity';
import { Sort } from '../../../common/interfaces/sort';
import { ParseIntWithOptionsPipe } from '../../../common/validators/parse-int-with-options.pipe';

export class BaseController<T extends BaseEntity> {

  private static readonly PARAM_PAGE = 'page';
  private static readonly PARAM_SIZE = 'size';
  private static readonly PARAM_SORT = 'sort';
  private static readonly PARAM_SEARCH_TERM = 'searchTerm';
  private static readonly PARAM_SEARCH_CRITERIA = 'searchCriteria';

  constructor(private readonly service: BaseService<T>) {}

  @Get()
  findAll(
    @Query(BaseController.PARAM_PAGE, ParseIntWithOptionsPipe) page: number,
    @Query(BaseController.PARAM_SIZE, ParseIntWithOptionsPipe) size?: number,
    @Query(BaseController.PARAM_SORT) sort?: Sort[],
    @Query(BaseController.PARAM_SEARCH_TERM) searchTerm?: string,
    @Query(BaseController.PARAM_SEARCH_CRITERIA) searchCriteria?: string
  ): Promise<T[]> {
    return this.service.findAll({ page, size, sort, searchTerm, searchCriteria });
  }

  // Override this method calling super to allow class-validator to validate the body
  @Post()
  create(@Body() entity: T): Promise<T> {
    return this.service.save(entity);
  }

  // Override this method calling super to allow class-validator to validate the body
  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() entity): Promise<T> {
    return this.service.update(id, entity);
  }

  @Delete(':id')
  deleteEntity(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteEntity(id);
  }
}
