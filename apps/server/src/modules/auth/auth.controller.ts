import { Controller, Post, Body, Session, HttpCode, Get, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { CurrentUser } from "./current-user.decorator";
import { User, UserRole } from "../../entity/user.entity";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(
    @Body() body: { userId: string; password: string; name: string; role?: UserRole },
    @Session() session: Record<string, any>
  ) {
    const user = await this.authService.register(
      body.userId,
      body.password,
      body.name,
      body.role
    );

    session.userId = user.id;

    return {
      success: true,
      message: "회원가입이 완료되었습니다.",
      user,
    };
  }

  @Post("login")
  @HttpCode(200)
  async login(
    @Body() body: { userId: string; password: string },
    @Session() session: Record<string, any>
  ) {
    const user = await this.authService.login(body.userId, body.password);

    session.userId = user.id;

    return {
      success: true,
      message: "로그인에 성공했습니다.",
      user,
    };
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Session() session: Record<string, any>) {
    session.userId = null;

    return {
      success: true,
      message: "로그아웃되었습니다.",
    };
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: User) {
    return {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
    };
  }
}
