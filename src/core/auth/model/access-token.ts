import { Token } from './token';

export class AccessToken extends Token {

  constructor(username: string, roles: string[]) {
    super(username, roles);
  }
}