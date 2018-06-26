import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [CoreModule, TaskModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
