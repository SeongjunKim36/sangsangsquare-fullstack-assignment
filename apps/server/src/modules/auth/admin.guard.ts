import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { UserRole } from "../../entity/user.entity";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("로그인이 필요합니다.");
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("관리자 권한이 필요합니다.");
    }

    return true;
  }
}
