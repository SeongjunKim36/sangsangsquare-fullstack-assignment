import { Controller, Get, Post, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { MeetingsService } from "./meetings.service";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { User } from "../../entity";

@UseGuards(AuthGuard)
@Controller("meetings")
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  async getMeetings(@CurrentUser() user: User) {
    return this.meetingsService.findAllForUser(user.id);
  }

  @Get(":meetingId")
  async getMeetingDetail(
    @Param("meetingId", ParseIntPipe) meetingId: number,
    @CurrentUser() user: User
  ) {
    return this.meetingsService.findOneForUser(meetingId, user.id);
  }

  @Post(":meetingId/applications")
  async applyToMeeting(
    @Param("meetingId", ParseIntPipe) meetingId: number,
    @CurrentUser() user: User
  ) {
    return this.meetingsService.applyToMeeting(meetingId, user.id, user.name);
  }
}
