import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { JwtStrategyService } from './service/jwt-strategy.service';
import { AuthController } from './controller/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './model/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    AuthService,
    JwtStrategyService,
    {
      provide: 'redis',
      useFactory: () => require('redis')
    }
  ],
  controllers: [AuthController]
})
export class AuthModule {}
