import { Controller, Get, Post, Param, ParseIntPipe, Session, UseGuards } from "@nestjs/common";
import type { Session as ExpressSession, SessionData } from "express-session";
import { MeetingsService } from "./meetings.service";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { User } from "../../entity";
import { UserService } from "../user/user.service";

@Controller("meetings")
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly userService: UserService
  ) {}

  @Get()
  async getMeetings(@Session() session: AppSession) {
    const userId = await this.getOptionalUserId(session);
    return this.meetingsService.findAll(userId);
  }

  @Get(":meetingId")
  async getMeetingDetail(
    @Param("meetingId", ParseIntPipe) meetingId: number,
    @Session() session: AppSession
  ) {
    const userId = await this.getOptionalUserId(session);
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

  private async getOptionalUserId(session: AppSession): Promise<number | null> {
    if (!session.userId) {
      return null;
    }

    const user = await this.userService.findById(session.userId);
    return user?.id ?? null;
  }
}

type AppSession = ExpressSession & Partial<SessionData>;
