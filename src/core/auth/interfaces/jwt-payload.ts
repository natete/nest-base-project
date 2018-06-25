import { Token } from '../model/token';

export interface JwtPayload extends Token {

  // Issued at.
  iat: number;

  // Expiration time.
  exp: number;

  // Audience.
  aud: string[];

  // Issuer.
  iss: string;

  // Subject.
  sub: string;

  // JWT id
  jti: string;
}
