import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.session.userId;

    if (!userId) {
      throw new UnauthorizedException("로그인이 필요합니다.");
    }

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException("사용자를 찾을 수 없습니다.");
    }

    request.user = user;
    return true;
  }
}
