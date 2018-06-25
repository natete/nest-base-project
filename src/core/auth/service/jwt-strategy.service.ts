import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './service/auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from './interfaces/jwt-payload';
import { AuthConstants } from './auth.constants';
import { IncomingMessage } from 'http';
import { promisify } from 'util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env[AuthConstants.SECRET],
      passReqToCallback: true
    });
  }

  async validate(req: IncomingMessage, payload: JwtPayload, done: (error: Error, user: any | false) => any) {

    const isValidToken = await this.authService.isValidUser(payload);

    if (!isValidToken) {
      return done(new UnauthorizedException(), false);
    }

    req.headers.authorization = JSON.stringify(payload);
    done(null, payload);
  }
}
