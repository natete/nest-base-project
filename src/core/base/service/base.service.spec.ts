import { Test, TestingModule } from '@nestjs/testing';
import { BaseService } from './base.service';
import { Like, Repository } from 'typeorm';
import { Sort } from '../../../common/interfaces/sort';
import { SortDirection } from '../../../common/interfaces/sort-direction';

describe('BaseService', () => {
  let service: BaseService<any>;
  let repository: Repository<any>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaseService,
        {
          provide: 'Repository',
          useValue: {
            find: jest.fn()
          }
        }
      ]
    }).compile();
    service = module.get<BaseService<any>>(BaseService);
    repository = module.get<Repository<any>>(Repository);
    service.repository = repository;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {

    it('should call the repository with empty options when no find options are provided', async () => {

      await service.findAll();
      await service.findAll({});

      expect(repository.find).toHaveBeenNthCalledWith(1, {});
      expect(repository.find).toHaveBeenNthCalledWith(2, {});
    });

    it('should pass the page and the size as find options when provided', async () => {
      const size = 10;
      const page = 1;

      await service.findAll({ page, size });

      expect(repository.find).toHaveBeenCalledWith({ take: size, skip: 0 });
    });

    it('should pass the sort options as find options when provided', async () => {
      const sort: Sort[] = [
        { direction: SortDirection.ASC, field: 'foo' }
      ];

      await service.findAll({ sort });

      expect(repository.find).toHaveBeenCalledWith({ order: { foo: 'ASC' } });

    });

    it('should pass the query options when provided', async () => {
      const searchTerm = 'term';
      const searchCriteria = 'criteria';

      await service.findAll({ searchCriteria, searchTerm });

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          criteria: Like(`%${searchTerm.toLowerCase()}%`)
        }
      });
    });
  });
});
