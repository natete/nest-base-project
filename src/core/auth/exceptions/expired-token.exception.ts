import { HttpException } from '@nestjs/common';

export class ExpiredTokenException extends HttpException {
  constructor(message: string = 'Expired token') {
    super(message, 460);
  }
}