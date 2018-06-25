export class UserToken {
  readonly username: string;
  readonly type = 'ACCESS_TOKEN';
  readonly roles: string[];
}