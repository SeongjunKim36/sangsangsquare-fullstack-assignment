import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Meeting, Application, MeetingCategory } from "../../entity";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { MeetingMapper } from "../meetings/mappers/meeting.mapper";

@Module({
  imports: [
    TypeOrmModule.forFeature([Meeting, Application, MeetingCategory]),
    AuthModule,
    UserModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, MeetingMapper],
  exports: [AdminService],
})
export class AdminModule {}
