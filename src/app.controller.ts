import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Roles } from './core/auth/decorators/roles';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './core/auth/guards/roles.guard';

@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Roles('admin')
  root(): string {
    return this.appService.root();
  }
}
