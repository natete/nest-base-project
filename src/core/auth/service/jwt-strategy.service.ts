import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthConstants } from '../auth.constants';
import { CustomIncomingMessage } from '../interfaces/custom-incoming-message';
import { ExpiredTokenException } from '../exceptions/expired-token.exception';

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env[AuthConstants.SECRET],
      passReqToCallback: true,
      ignoreExpiration: true
    });
  }

  async validate(req: CustomIncomingMessage, payload: JwtPayload, done: (error: Error, user: any | false) => any) {

    const isExpiredToken = this.authService.isExpiredToken(payload);

    if (isExpiredToken) {
      return done(new ExpiredTokenException('Expired token'), false);
    }

    const isValidUser = await this.authService.isValidUser(payload);

    if (!isValidUser) {
      return done(new UnauthorizedException('Revoked token'), false);
    }

    req.data = req.data || {};
    req.data.user = payload;

    done(null, payload);
  }
}
