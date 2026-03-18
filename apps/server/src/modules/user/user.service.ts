import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findOrCreate(userId: string, name?: string): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { userId },
    });

    if (!user) {
      user = this.userRepository.create({
        userId,
        name: name || userId,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  async findByUserId(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { userId },
    });
  }
}
