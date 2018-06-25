import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtPayload } from './interfaces/jwt-payload';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { AuthConstants } from './auth.constants';
import { User } from './model/user.entity';
import { Repository } from 'typeorm';
import { of } from 'rxjs/internal/observable/of';

export interface Token {
  expiresIn: number;
  accessToken: string;
}

@Injectable()
export class AuthService {

  constructor(@Inject(AuthConstants.USER_REPOSITORY) private readonly repository: Repository<User>) {}

  validateUser(payload: JwtPayload) {

  }

  createToken(email: string): Token {
    const user: JwtPayload = { email };
    const expiresIn = +process.env[AuthConstants.ACCESS_TOKEN_EXPIRATION];
    const accessToken: string = jwt.sign(user, 'secret', { expiresIn });

    return {
      expiresIn,
      accessToken
    };
  }


  async createUser(username: string, password: string) {
    const user: User = {
      username,
      password: bcrypt.hashSync(password, 10)
    };

    return this.repository.save(user)
      .then(() => Promise.resolve(null))
      .catch(() => new BadRequestException('Username already used'));
  }
}
