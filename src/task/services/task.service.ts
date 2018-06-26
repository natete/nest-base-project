import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../model/task.entity';
import { Repository } from 'typeorm';
import { BaseService } from '../../core/base/service/base.service';

@Injectable()
export class TaskService extends BaseService<Task> {

  constructor(@InjectRepository(Task) private readonly taskRepository: Repository<Task>) {
    super(taskRepository);
  }
}
