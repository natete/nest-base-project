export class AccessToken {
  readonly username: string;
  readonly type = 'ACCESS_TOKEN';
  readonly roles: string[];


  constructor(username: string, roles: string[]) {
    this.username = username;
    this.roles = roles;
  }
}