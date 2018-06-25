import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../interfaces/jwt-payload';
import { CustomIncomingMessage } from '../interfaces/custom-incoming-message';

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(@Inject('Reflector') private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

    const requiredRoles = this.reflector.get<string[]>('authorities', context.getHandler());

    const request: CustomIncomingMessage = context.switchToHttp().getRequest();

    const user = request.data.user as JwtPayload;

    return requiredRoles.every(requestedRole => user.authorities.some(role => role === requestedRole));
  }
}
