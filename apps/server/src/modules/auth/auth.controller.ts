import {
  Controller,
  Post,
  Body,
  Session,
  HttpCode,
  Get,
  UseGuards,
  Res,
  InternalServerErrorException,
} from "@nestjs/common";
import type { Response } from "express";
import type { Session as ExpressSession, SessionData } from "express-session";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { User } from "../../entity/user.entity";
import { LoginDto } from "../../dto";
import { SESSION_COOKIE_NAME } from "../../constants";

type AppSession = ExpressSession & Partial<SessionData>;

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Session() session: AppSession) {
    const user = await this.authService.login(dto.userId, dto.password);

    session.userId = user.id;

    return {
      success: true,
      message: "로그인에 성공했습니다.",
      user,
    };
  }

  @Post("logout")
  @HttpCode(200)
  async logout(@Session() session: AppSession, @Res({ passthrough: true }) response: Response) {
    try {
      await new Promise<void>((resolve, reject) => {
        session.destroy((error) => {
          if (error) {
            reject(
              error instanceof Error
                ? error
                : new Error("세션 종료 중 알 수 없는 오류가 발생했습니다.")
            );
            return;
          }
          resolve();
        });
      });
    } catch {
      throw new InternalServerErrorException("로그아웃 처리 중 오류가 발생했습니다.");
    }

    response.clearCookie(SESSION_COOKIE_NAME, { path: "/" });

    return {
      success: true,
      message: "로그아웃되었습니다.",
    };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
    };
  }
}
