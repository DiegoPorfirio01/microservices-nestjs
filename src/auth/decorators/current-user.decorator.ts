import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserSession } from '../services/auth.service';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: UserSession }>();
    return request.user;
  },
);
