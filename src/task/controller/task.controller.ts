import { Controller, UseGuards } from '@nestjs/common';
import { Task } from '../model/task.entity';
import { TaskService } from '../services/task.service';
import { AuthGuard } from '@nestjs/passport';
import { BaseController } from '../../core/base/controller/base.controller';

@Controller('task')
@UseGuards(AuthGuard('jwt'))
export class TaskController extends BaseController<Task> {

  constructor(private readonly taskService: TaskService) {
    super(taskService);
  }
}
