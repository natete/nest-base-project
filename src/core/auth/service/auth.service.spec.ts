import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthConstants } from '../auth.constants';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { User } from '../model/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { RefreshToken } from '../model/refresh-token';
import { v4 } from 'uuid';
import { AccessToken } from '../model/access-token';
import { promisify } from 'util';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ExpiredTokenException } from '../exceptions/expired-token.exception';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let provider: AuthService;
  let repository: any;
  let redis: any;
  let client;
  let expiredRefreshToken: string;
  let aliveRefreshToken: string;
  let expiredAccessToken: string;
  let aliveAccessToken: string;
  let mockAdminUser: User;
  let jwtPayload: JwtPayload;
  let refreshJwtid: string;
  let accessJwtid: string;

  beforeAll(async () => {
    dotenv.config();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'UserRepository',
          useValue: {
            findOne: () => null
          }
        },
        {
          provide: 'redis',
          useFactory: () => require('redis-mock')
        }
      ]
    }).compile();

    // Init providers
    provider = module.get<AuthService>(AuthService);
    repository = module.get<Repository<User>>('UserRepository');
    redis = module.get<any>('redis');

    initHelperVariables();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('login', () => {

    it('should log in with valid credentials', async () => {
      jest.spyOn(repository, 'findOne').mockReturnValue(mockAdminUser);

      const authentication = await provider.login('jsmith', '1234');

      expect(authentication.accessToken).toBeDefined();
      expect(authentication.refreshToken).toBeDefined();
    });

    it('should fail with invalid credentials', async () => {
      jest.spyOn(repository, 'findOne').mockReturnValue(mockAdminUser);

      await expect(provider.login('jsmith', '12345'))
        .rejects
        .toMatchObject(Object.assign({}, new UnauthorizedException('Invalid credentials')));
    });

    it('should fail with user not in database', async () => {
      jest.spyOn(repository, 'findOne').mockReturnValue(null);

      await expect(provider.login('jsmith', '1234'))
        .rejects
        .toMatchObject(Object.assign({}, new UnauthorizedException('Invalid credentials')));
    });
  });

  describe('refresh token', () => {

    afterEach(async () => {
      if (client) {
        client.flushall();
        client.quit();
        client = null;
      }
    });

    it('should fail on invalid token', async () => {
      await expect(provider.refresh('foo'))
        .rejects
        .toMatchObject(Object.assign({}, new BadRequestException('Invalid token')));
    });

    it('should fail on expired token', async () => {

      jest.spyOn(repository, 'findOne').mockReturnValue(mockAdminUser);

      await expect(provider.refresh(expiredRefreshToken))
        .rejects
        .toMatchObject(Object.assign({}, new ExpiredTokenException()));
    });

    it('should fail on revoked token', async () => {

      client = redis.createClient('127.0.0.1', 6379, {});

      client.set(refreshJwtid, refreshJwtid);

      jest.spyOn(repository, 'findOne').mockReturnValue(mockAdminUser);

      await expect(provider.refresh(aliveRefreshToken))
        .rejects
        .toMatchObject(Object.assign({}, new BadRequestException('Revoked token')));
    });

    it('should return valid authentication on valid token', async () => {

      jest.spyOn(repository, 'findOne').mockReturnValue(mockAdminUser);

      const authentication = await provider.refresh(aliveRefreshToken);

      expect(authentication.accessToken).toBeDefined();
      expect(authentication.refreshToken).toBe(aliveRefreshToken);
    });
  });

  describe('revoke token', () => {

    afterEach(async () => {
      if (client) {
        client.flushall();
        client.quit();
        client = null;
      }
    });

    it('should not store expired refresh token', async () => {

      client = redis.createClient('127.0.0.1', 6379, {});

      await provider.revoke(aliveAccessToken, expiredRefreshToken);

      const getAsync = promisify(client.get).bind(client);

      const storedJwId = await getAsync(refreshJwtid);

      expect(storedJwId).toBeNull();
    });

    it('should not store an expired access token', async () => {
      client = redis.createClient('127.0.0.1', 6379, {});

      await provider.revoke(expiredAccessToken, aliveRefreshToken);

      const getAsync = promisify(client.get).bind(client);

      const storedAccessJwId = await getAsync(accessJwtid);
      const storedRefreshJwId = await getAsync(refreshJwtid);

      expect(storedAccessJwId).toBeNull();
      expect(storedRefreshJwId).toBe(refreshJwtid);
    });

    it('should store access and refresh tokens when they are valid', async () => {
      client = redis.createClient('127.0.0.1', 6379, {});

      await provider.revoke(aliveAccessToken, aliveRefreshToken);

      const getAsync = promisify(client.get).bind(client);

      const storedAccessJwId = await getAsync(accessJwtid);
      const storedRefreshJwId = await getAsync(refreshJwtid);

      expect(storedAccessJwId).toBe(accessJwtid);
      expect(storedRefreshJwId).toBe(refreshJwtid);
    });
  });

  describe('validate user', () => {

    afterEach(async () => {
      if (client) {
        client.flushall();
        client.quit();
        client = null;
      }
    });

    it('should report user as invalid', async () => {

      client = redis.createClient('127.0.0.1', 6379, {});

      client.set('foo', 'foo');

      const result = await provider.isValidUser(jwtPayload);

      expect(result).toBeFalsy();
    });

    it('should report user as valid', async () => {

      const result = await provider.isValidUser(jwtPayload);

      expect(result).toBeTruthy();
    });
  });

  function initHelperVariables() {
    mockAdminUser = {
      id: 1,
      username: 'jsmith',
      password: bcrypt.hashSync('1234', 10),
      roles: ['admin']
    };

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

    refreshJwtid = v4();
    accessJwtid = v4();

    const userRefreshToken = new RefreshToken('foo');

    const refreshJwtOptions: SignOptions = {
      expiresIn: 0,
      jwtid: refreshJwtid
    };

    expiredRefreshToken = jwt.sign(
      { authorities: userRefreshToken.authorities },
      process.env[AuthConstants.SECRET],
      refreshJwtOptions
    );

    aliveRefreshToken = jwt.sign(
      { authorities: userRefreshToken.authorities },
      process.env[AuthConstants.SECRET],
      Object.assign({}, refreshJwtOptions, { expiresIn: 1000 })
    );

    const userAccessToken = new AccessToken('foo', []);

    const accessJwtOptions: SignOptions = {
      expiresIn: 0,
      jwtid: accessJwtid
    };

    expiredAccessToken = jwt.sign(
      { authorities: userAccessToken.authorities },
      process.env[AuthConstants.SECRET],
      accessJwtOptions
    );

    aliveAccessToken = jwt.sign(
      { authorities: userAccessToken.authorities },
      process.env[AuthConstants.SECRET],
      Object.assign({}, accessJwtOptions, { expiresIn: 1000 })
    );
  }
});
