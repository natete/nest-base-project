import { Token } from './token';
import { AuthConstants } from '../auth.constants';

export class RefreshToken extends Token {

  constructor(username: string) {
    super(username, [AuthConstants.REFRESH_AUTHORITY]);
  }
}