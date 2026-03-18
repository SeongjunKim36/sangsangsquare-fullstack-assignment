import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "../../entity/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async register(userId: string, password: string, name: string, role: UserRole = UserRole.USER) {
    const existing = await this.userRepository.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException("이미 사용 중인 아이디입니다.");
    }

    const user = this.userRepository.create({
      userId,
      password,
      name,
      role,
    });

    await user.hashPassword();
    await this.userRepository.save(user);

    return {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
    };
  }

  async validateUser(userId: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { userId },
    });

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
