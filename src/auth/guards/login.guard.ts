import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LoginGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext) {
    console.log(1)
    const result = (await super.canActivate(context)) as boolean;
    console.log(1.1)
    const request = context.switchToHttp().getRequest();
    console.log(1.2)
    await super.logIn(request);
    console.log(1.3)
    return result;
  }
}