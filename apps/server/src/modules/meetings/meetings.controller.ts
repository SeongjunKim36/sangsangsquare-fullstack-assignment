import { Controller, Get, Post, Param, ParseIntPipe, Session, UseGuards } from "@nestjs/common";
import type { Session as ExpressSession, SessionData } from "express-session";
import { MeetingsService } from "./meetings.service";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { User } from "../../entity";

@Controller("meetings")
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get()
  async getMeetings(@Session() session: AppSession) {
    const userId = this.getOptionalUserId(session);
    return this.meetingsService.findAll(userId);
  }

  @Get(":meetingId")
  async getMeetingDetail(
    @Param("meetingId", ParseIntPipe) meetingId: number,
    @Session() session: AppSession
  ) {
    const userId = this.getOptionalUserId(session);
    return this.meetingsService.findOne(meetingId, userId);
  }

  @UseGuards(AuthGuard)
  @Post(":meetingId/applications")
  async applyToMeeting(
    @Param("meetingId", ParseIntPipe) meetingId: number,
    @CurrentUser() user: User
  ) {
    return this.meetingsService.applyToMeeting(meetingId, user.id, user.name);
  }

  private getOptionalUserId(session: AppSession): number | null {
    return session.userId ?? null;
  }
}

type AppSession = ExpressSession & Partial<SessionData>;
