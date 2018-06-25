import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategyService } from './jwt-strategy.service';
import * as dotenv from 'dotenv';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { AuthConstants } from '../auth.constants';
import { AccessToken } from '../model/access-token';
import { v4 } from 'uuid';
import { JwtPayload } from '../interfaces/jwt-payload';
import { UnauthorizedException } from '@nestjs/common';
import { CustomIncomingMessage } from '../interfaces/custom-incoming-message';

describe('JwtStrategyService', () => {

  let strategyService: JwtStrategyService;
  let authService: AuthService;
  let aliveAccessToken: string;
  let accessJwtid: string;
  let jwtPayload: JwtPayload;

  beforeAll(async () => {
    dotenv.config();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategyService,
        {
          provide: 'AuthService',
          useValue: { isValidUser: (payload) => null }
        }
      ]
    }).compile();

    strategyService = module.get<JwtStrategyService>(JwtStrategyService);
    authService = module.get<AuthService>(AuthService);

    accessJwtid = v4();

    const userAccessToken = new AccessToken('foo', []);

    const accessJwtOptions: SignOptions = {
      expiresIn: 9999,
      jwtid: accessJwtid
    };

    aliveAccessToken = jwt.sign(
      { authorities: userAccessToken.authorities },
      process.env[AuthConstants.SECRET],
      accessJwtOptions
    );

    jwtPayload = {
      iat: 0,
      exp: 0,
      aud: [],
      iss: '',
      sub: '',
      jti: 'foo',
      username: '',
      authorities: []
    };
  });

  it('should be defined', () => {
    expect(strategyService).toBeDefined();
  });

  it('should fail on revoked token', async () => {
    jest.spyOn(authService, 'isValidUser').mockReturnValue(false);

    const incomingMessage = new CustomIncomingMessage(null);
    const done = jest.fn();

    await strategyService.validate(incomingMessage, jwtPayload, done);

    expect(done.mock.calls[0][0]).toMatchObject(Object.assign({}, new UnauthorizedException()));
    expect(done.mock.calls[0][1]).toBeFalsy();
  });

  it('should return the token from the user on valid token', async () => {
    jest.spyOn(authService, 'isValidUser').mockReturnValue(true);

    const incomingMessage = new CustomIncomingMessage(null);
    const done = jest.fn();

    await strategyService.validate(incomingMessage, jwtPayload, done);

    expect(done.mock.calls[0][0]).toBeNull();
    expect(done.mock.calls[0][1]).toBe(jwtPayload);
    expect(incomingMessage.data.user).toBe(jwtPayload);
  });
});
