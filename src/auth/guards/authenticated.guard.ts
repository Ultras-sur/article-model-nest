import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    console.log(1.4)
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated();
  }
}