import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Meeting, Application, User, MeetingCategory } from "../../entity";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { MeetingMapper } from "../meetings/mappers/meeting.mapper";

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, Application, User, MeetingCategory])],
  controllers: [AdminController],
  providers: [AdminService, MeetingMapper],
  exports: [AdminService],
})
export class AdminModule {}
