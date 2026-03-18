import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { CreateMeetingDto, UpdateApplicationStatusDto } from "../../dto";
import { AuthGuard } from "../auth/auth.guard";
import { AdminGuard } from "../auth/admin.guard";

@Controller("admin")
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post("meetings")
  async createMeeting(@Body() dto: CreateMeetingDto) {
    return this.adminService.createMeeting(dto);
  }

  @Get("meetings")
  async getMeetings() {
    return this.adminService.findAllMeetings();
  }

  @Get("meetings/:meetingId")
  async getMeetingDetail(@Param("meetingId", ParseIntPipe) meetingId: number) {
    return this.adminService.findOneMeeting(meetingId);
  }

  @Get("meetings/:meetingId/applications")
  async getApplications(@Param("meetingId", ParseIntPipe) meetingId: number) {
    return this.adminService.findApplications(meetingId);
  }

  @Patch("meetings/:meetingId/applications/:applicationId/status")
  async updateApplicationStatus(
    @Param("meetingId", ParseIntPipe) meetingId: number,
    @Param("applicationId", ParseIntPipe) applicationId: number,
    @Body() dto: UpdateApplicationStatusDto
  ) {
    return this.adminService.updateApplicationStatus(meetingId, applicationId, dto);
  }
}
