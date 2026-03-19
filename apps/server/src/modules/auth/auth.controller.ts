import { Controller, Post, Body, Session, HttpCode, Get, UseGuards } from "@nestjs/common";
import type { Session as ExpressSession, SessionData } from "express-session";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { User } from "../../entity/user.entity";
import { LoginDto } from "../../dto";

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
  logout(@Session() session: AppSession) {
    delete session.userId;

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
