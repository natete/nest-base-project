import { Module } from '@nestjs/common';
import { TaskController } from './controller/task.controller';
import { TaskService } from './services/task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './model/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
