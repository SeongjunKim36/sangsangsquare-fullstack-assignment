import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "../../entity/user.entity";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(userId: string, password: string): Promise<User | null> {
    const user = await this.userService.findByUserId(userId);

    if (!user || !user.password) {
      return null;
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async login(userId: string, password: string) {
    const user = await this.validateUser(userId, password);

    if (!user) {
      throw new UnauthorizedException("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    return {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
    };
  }
}
