export class Token {
  readonly username: string;
  readonly authorities: string[];

  constructor(username: string, roles: string[]) {
    this.username = username;
    this.authorities = roles;
  }
}