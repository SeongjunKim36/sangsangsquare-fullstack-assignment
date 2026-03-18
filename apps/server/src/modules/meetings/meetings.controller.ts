import { Controller, Get, Post, Param, Body, ParseIntPipe } from "@nestjs/common";
import { MeetingsService } from "./meetings.service";
import { UserService } from "../user/user.service";
import { ApplyToMeetingDto } from "../../dto";

@Controller("meetings")
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly userService: UserService
  ) {}

  @Get()
  async getMeetings() {
    return this.meetingsService.findAll();
  }

  @Get(":meetingId")
  async getMeetingDetail(@Param("meetingId", ParseIntPipe) meetingId: number) {
    return this.meetingsService.findOne(meetingId);
  }

  @Post(":meetingId/applications")
  async applyToMeeting(
    @Param("meetingId", ParseIntPipe) meetingId: number,
    @Body() dto: ApplyToMeetingDto
  ) {
    const user = await this.userService.findOrCreate(dto.applicantId, dto.applicantName);
    return this.meetingsService.applyToMeeting(meetingId, user.id, user.name);
  }
}
