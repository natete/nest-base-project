import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { AuthConstants } from '../auth.constants';
import { User } from '../model/user.entity';
import { Repository } from 'typeorm';
import { AccessToken } from '../model/access-token';
import { RefreshToken } from '../model/refresh-token';
import { JwtPayload } from '../interfaces/jwt-payload';
import { RedisClient } from 'redis';
import { promisify } from 'util';
import { v4 } from 'uuid';
import { ExpiredTokenException } from '../exceptions/expired-token.exception';

export interface Authentication {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {

  private readonly accessExpiration = process.env[AuthConstants.ACCESS_TOKEN_EXPIRATION];
  private readonly refreshExpiration = process.env[AuthConstants.REFRESH_TOKEN_EXPIRATION];
  private readonly secret = process.env[AuthConstants.SECRET];
  private readonly issuer = process.env[AuthConstants.ISSUER];
  private readonly audience = process.env[AuthConstants.AUDIENCE].split(',');
  private readonly EXPIRATION_MODE = 'EX';

  constructor(@Inject(AuthConstants.USER_REPOSITORY) private readonly repository: Repository<User>,
              @Inject('redis') private readonly redis: any) {}

  async login(username: string, password: string): Promise<Authentication> {

    const user: User = await this.repository.findOne({ username });

    if (bcrypt.compareSync(password, user.password)) {

      const accessToken = this.getAccessToken(user);

      const refreshToken = this.getRefreshToken(user);

      return {
        accessToken,
        refreshToken
      };

    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async createUser(username: string, password: string, roles: string[]) {
    const user: User = {
      username,
      password: bcrypt.hashSync(password, 10),
      roles
    };

    return this.repository.save(user)
      .then(() => Promise.resolve(null))
      .catch(() => new BadRequestException('Username already used'));
  }

  isExpiredToken(payload: JwtPayload): boolean {
    return payload.exp < ((new Date()).getTime() / 1000);
  }

  async isValidUser(payload: JwtPayload): Promise<boolean> {
    const client: RedisClient = this.redis.createClient();

    const getAsync = promisify(client.get).bind(client);

    const token = await getAsync(payload.jti);

    client.quit();

    return !token;
  }

  async revoke(accessToken: string, refreshToken: string) {
    const accessPayload = jwt.decode(accessToken, { json: true }) as JwtPayload;
    this.revokeJwtToken(accessPayload);

    const refreshPayload = jwt.decode(refreshToken, { json: true }) as JwtPayload;
    this.revokeJwtToken(refreshPayload);
  }

  async refresh(refreshToken: string): Promise<Authentication> {
    const payload = jwt.decode(refreshToken, { json: true }) as JwtPayload;

    if (!payload) {
      throw new BadRequestException('Invalid token');
    }

    if (this.isExpiredToken(payload)) {
      throw new ExpiredTokenException('Expired token');
    }

    if (!await this.isValidUser(payload)) {
      throw new BadRequestException('Revoked token');
    }

    if (payload.authorities.every(authority => authority === AuthConstants.REFRESH_AUTHORITY)) {

      const user: User = await this.repository.findOne({ username: payload.sub });

      return {
        accessToken: this.getAccessToken(user),
        refreshToken
      };
    }
  }

  private async revokeJwtToken(payload: JwtPayload) {
    const duration = payload.exp - Math.round((new Date()).getTime() / 1000);

    if (duration > 0) {
      const client: RedisClient = this.redis.createClient();

      const setAsync = promisify(client.set).bind(client);

      await setAsync(payload.jti, payload.jti, this.EXPIRATION_MODE, duration);

      client.quit();
    }
  }

  private getAccessToken(user: User): string {
    const userAccessToken = new AccessToken(user.username, user.roles);

    return jwt.sign(
      { authorities: userAccessToken.authorities },
      this.secret,
      this.getSignOptions(userAccessToken.username, this.accessExpiration)
    );
  }

  private getRefreshToken(user: User) {
    const userRefreshToken = new RefreshToken(user.username);

    return jwt.sign(
      { authorities: userRefreshToken.authorities },
      this.secret,
      this.getSignOptions(userRefreshToken.username, this.refreshExpiration)
    );
  }

  private getSignOptions(subject: string, expiration: string): SignOptions {
    return {
      subject,
      expiresIn: expiration,
      issuer: this.issuer,
      audience: this.audience,
      jwtid: v4()
    };
  }
}
