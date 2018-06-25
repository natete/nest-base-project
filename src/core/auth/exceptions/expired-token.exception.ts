import { HttpException } from '@nestjs/common';

export class ExpiredTokenException extends HttpException {
  constructor(message: string) {
    super(message, 481);
  }
}