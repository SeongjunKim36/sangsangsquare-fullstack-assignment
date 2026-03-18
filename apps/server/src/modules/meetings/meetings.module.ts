import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Meeting, Application } from "../../entity";
import { MeetingsController } from "./meetings.controller";
import { MeetingsService } from "./meetings.service";
import { UserModule } from "../user/user.module";
import { MeetingMapper } from "./mappers/meeting.mapper";

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, Application]), forwardRef(() => UserModule)],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingMapper],
  exports: [MeetingsService],
})
export class MeetingsModule {}
