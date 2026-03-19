import { Controller, Get, UseGuards } from "@nestjs/common";
import { User } from "../../entity";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { MeetingsService } from "./meetings.service";

@Controller("me")
@UseGuards(AuthGuard)
export class MeController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Get("applications")
  async getMyApplications(@CurrentUser() user: User) {
    return this.meetingsService.getMyApplications(user.id);
  }
}
