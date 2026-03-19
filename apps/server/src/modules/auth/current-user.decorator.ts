import { UnauthorizedException, createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import { User } from "../../entity/user.entity";

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest<Request>();
  if (!request.user) {
    throw new UnauthorizedException("인증된 사용자를 찾을 수 없습니다.");
  }
  return request.user;
});
