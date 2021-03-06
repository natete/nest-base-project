import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { Authentication, AuthService } from '../service/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthConstants } from '../auth.constants';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles';
import { ApiBearerAuth, ApiImplicitBody } from '@nestjs/swagger';

@Controller(AuthConstants.AUTH_ENDPOINT)
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  createUser(@Body('username') username: string, @Body('password') password: string, @Body('authorities') roles: string[]) {
    return this.authService.createUser(username, password, roles);
  }

  @Post('login')
  @ApiImplicitBody({ name: 'username and password', description: 'username and password', type: String })
  async login(@Body('username') username: string, @Body('password') password: string): Promise<Authentication> {
    return this.authService.login(username, password);
  }

  @Post(AuthConstants.REVOKE_ENDPOINT)
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async revoke(@Body('accessToken') accessToken: string, @Body('refreshToken') refreshToken: string) {
    return this.authService.revoke(accessToken, refreshToken);
  }

  @Post(AuthConstants.REFRESH_ENDPOINT)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(AuthConstants.REFRESH_AUTHORITY)
  @ApiBearerAuth()
  async refresh(@Headers('authorization') authorization) {
    return this.authService.refresh(authorization.replace('bearer ', ''));
  }
}
