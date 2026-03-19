import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Meeting, Application } from "../../entity";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { MeetingsController } from "./meetings.controller";
import { MeController } from "./me.controller";
import { MeetingsService } from "./meetings.service";
import { MeetingMapper } from "./mappers/meeting.mapper";

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, Application]), AuthModule, UserModule],
  controllers: [MeetingsController, MeController],
  providers: [MeetingsService, MeetingMapper],
  exports: [MeetingsService],
})
export class MeetingsModule {}
