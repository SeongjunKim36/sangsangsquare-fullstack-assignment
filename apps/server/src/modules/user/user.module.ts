import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../entity";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { MeetingsModule } from "../meetings/meetings.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => MeetingsModule)],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
