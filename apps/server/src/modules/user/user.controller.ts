import { BadRequestException, Controller, Get, Query, Param, ParseIntPipe } from "@nestjs/common";
import { MeetingsService } from "../meetings/meetings.service";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly userService: UserService
  ) {}

  @Get("me/applications")
  async getMyApplications(@Query("userId") userId: string) {
    if (!userId) {
      throw new BadRequestException("userId is required");
    }
    const user = await this.userService.findOrCreate(userId);
    return this.meetingsService.getMyApplications(user.id);
  }

  @Get("me/meetings")
  async getMyMeetings(@Query("userId") userId: string) {
    if (!userId) {
      throw new BadRequestException("userId is required");
    }
    const user = await this.userService.findOrCreate(userId);
    return this.meetingsService.findAllForUser(user.id);
  }

  @Get("me/meetings/:meetingId")
  async getMyMeetingDetail(
    @Param("meetingId", ParseIntPipe) meetingId: number,
    @Query("userId") userId: string
  ) {
    if (!userId) {
      throw new BadRequestException("userId is required");
    }
    const user = await this.userService.findOrCreate(userId);
    return this.meetingsService.findOneForUser(meetingId, user.id);
  }
}
