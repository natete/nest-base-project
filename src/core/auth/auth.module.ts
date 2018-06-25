import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { JwtStrategyService } from './service/jwt-strategy.service';
import { AuthController } from './controller/auth.controller';
import { DatabaseModule } from '../database/database.module';
import { userReposiotryProvider } from './model/user.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    AuthService,
    JwtStrategyService,
    ...userReposiotryProvider,
    {
      provide: 'redis',
      useFactory: () => require('redis')
    }
  ],
  controllers: [AuthController]
})
export class AuthModule {}
