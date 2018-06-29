import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
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

  @Post()
  create(@Body() task: Task): Promise<Task> {
    return super.create(task);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() task: Task): Promise<Task> {
    return super.update(id, task);
  }
}
